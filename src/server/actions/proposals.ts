"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  users,
  influencerProfiles,
  proposals,
  campaigns,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createProposalSchema,
  type CreateProposalInput,
} from "@/lib/validators/proposal";
import { dollarsToCents } from "@/lib/constants";
import {
  FREE_TIER_MONTHLY_PROPOSAL_LIMIT,
  getMonthlyProposalCount,
} from "@/server/queries/proposals";

async function getInfluencerProfileForCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "influencer")
    throw new Error("Not an influencer account");

  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.userId, user.id))
    .limit(1);

  if (!profile) throw new Error("Influencer profile not found");

  return profile;
}

export async function submitProposal(input: CreateProposalInput) {
  const profile = await getInfluencerProfileForCurrentUser();

  const parsed = createProposalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid proposal data" };
  }

  // Check campaign exists and is published
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, parsed.data.campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.status !== "published")
    return { error: "Campaign is not accepting proposals" };

  // Check for existing proposal
  const [existing] = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(
      and(
        eq(proposals.campaignId, parsed.data.campaignId),
        eq(proposals.influencerProfileId, profile.id),
      ),
    )
    .limit(1);

  if (existing) return { error: "You have already applied to this campaign" };

  // Free tier: cap at 5 proposals per calendar month. Pro is unlimited.
  if (profile.subscriptionTier !== "pro") {
    const used = await getMonthlyProposalCount(profile.id);
    if (used >= FREE_TIER_MONTHLY_PROPOSAL_LIMIT) {
      return {
        error: `You've used all ${FREE_TIER_MONTHLY_PROPOSAL_LIMIT} of your free applications this month. Upgrade to Pro for unlimited applications.`,
      };
    }
  }

  // Check max applications
  if (
    campaign.maxApplications &&
    campaign.applicationCount >= campaign.maxApplications
  ) {
    return { error: "This campaign has reached its maximum number of applications" };
  }

  await db.insert(proposals).values({
    campaignId: parsed.data.campaignId,
    influencerProfileId: profile.id,
    type: "inbound",
    coverLetter: parsed.data.coverLetter,
    proposedRate: dollarsToCents(parsed.data.proposedRate),
  });

  // Increment application count
  await db
    .update(campaigns)
    .set({ applicationCount: campaign.applicationCount + 1 })
    .where(eq(campaigns.id, campaign.id));

  revalidatePath(`/campaigns/${campaign.id}`);
  return { success: true };
}

export async function updateProposalStatus(
  proposalId: string,
  status: "shortlisted" | "accepted" | "rejected",
  rejectionReason?: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify the current user is the brand that owns the campaign
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "brand") throw new Error("Not a brand account");

  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal) return { error: "Proposal not found" };

  await db
    .update(proposals)
    .set({
      status,
      rejectionReason: rejectionReason ?? null,
    })
    .where(eq(proposals.id, proposalId));

  revalidatePath(`/campaigns/${proposal.campaignId}`);
  return { success: true };
}
