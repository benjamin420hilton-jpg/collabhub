"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  users,
  brandProfiles,
  influencerProfiles,
  proposals,
  campaigns,
  contracts,
  milestones,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createContractSchema,
  submitMilestoneSchema,
  reviewMilestoneSchema,
  type CreateContractInput,
  type SubmitMilestoneInput,
  type ReviewMilestoneInput,
} from "@/lib/validators/contract";
import { dollarsToCents, PLATFORM_FEE_RATES, calculatePlatformFee } from "@/lib/constants";

async function getCurrentBrandProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (!user || user.role !== "brand") throw new Error("Not a brand account");

  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, user.id))
    .limit(1);

  if (!profile) throw new Error("Brand profile not found");
  return profile;
}

async function getCurrentInfluencerProfile() {
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

export async function createContract(input: CreateContractInput) {
  const brandProfile = await getCurrentBrandProfile();

  const parsed = createContractSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid contract data" };
  }

  // Get the proposal
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, parsed.data.proposalId))
    .limit(1);

  if (!proposal) return { error: "Proposal not found" };
  if (proposal.status !== "accepted")
    return { error: "Proposal must be accepted first" };

  // Verify brand owns the campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, proposal.campaignId))
    .limit(1);

  if (!campaign || campaign.brandProfileId !== brandProfile.id)
    return { error: "Unauthorized" };

  // Check if contract already exists for this proposal
  const [existing] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(eq(contracts.proposalId, proposal.id))
    .limit(1);

  if (existing) return { error: "Contract already exists for this proposal" };

  // Calculate financials
  const totalAmountDollars = parsed.data.milestones.reduce(
    (sum, m) => sum + m.amount,
    0,
  );
  const totalAmount = dollarsToCents(totalAmountDollars);
  const feeRate =
    PLATFORM_FEE_RATES[brandProfile.subscriptionTier] ??
    PLATFORM_FEE_RATES.free;
  const feeAmount = calculatePlatformFee(totalAmount, feeRate);
  const influencerPayout = totalAmount - feeAmount;

  const isGifting = campaign.type === "gifting";

  // Create contract
  const [contract] = await db
    .insert(contracts)
    .values({
      proposalId: proposal.id,
      brandProfileId: brandProfile.id,
      influencerProfileId: proposal.influencerProfileId,
      status: isGifting ? "active" : "pending_escrow",
      totalAmount: isGifting ? 0 : totalAmount,
      platformFeeRate: isGifting ? 0 : feeRate,
      platformFeeAmount: isGifting ? 0 : feeAmount,
      influencerPayout: isGifting ? 0 : influencerPayout,
    })
    .returning();

  // Create milestones
  await db.insert(milestones).values(
    parsed.data.milestones.map((m, i) => ({
      contractId: contract.id,
      sortOrder: i + 1,
      title: m.title,
      description: m.description ?? null,
      amount: isGifting ? 0 : dollarsToCents(m.amount),
      dueDate: m.dueDate ?? null,
    })),
  );

  // Update campaign status
  await db
    .update(campaigns)
    .set({ status: "in_progress" })
    .where(eq(campaigns.id, campaign.id));

  revalidatePath("/contracts");
  redirect(`/contracts/${contract.id}`);
}

export async function submitMilestone(input: SubmitMilestoneInput) {
  const influencerProfile = await getCurrentInfluencerProfile();

  const parsed = submitMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid submission data" };
  }

  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, parsed.data.milestoneId))
    .limit(1);

  if (!milestone) return { error: "Milestone not found" };

  // Verify influencer owns this contract
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, milestone.contractId))
    .limit(1);

  if (!contract || contract.influencerProfileId !== influencerProfile.id)
    return { error: "Unauthorized" };

  if (milestone.status !== "pending" && milestone.status !== "in_progress" && milestone.status !== "revision_requested")
    return { error: "Milestone cannot be submitted in its current state" };

  await db
    .update(milestones)
    .set({
      status: "submitted",
      submissionUrl: parsed.data.submissionUrl,
      submissionNotes: parsed.data.submissionNotes ?? null,
      submittedAt: new Date(),
    })
    .where(eq(milestones.id, milestone.id));

  revalidatePath(`/contracts/${contract.id}`);
  return { success: true };
}

export async function reviewMilestone(input: ReviewMilestoneInput) {
  const brandProfile = await getCurrentBrandProfile();

  const parsed = reviewMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid review data" };
  }

  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, parsed.data.milestoneId))
    .limit(1);

  if (!milestone) return { error: "Milestone not found" };
  if (milestone.status !== "submitted")
    return { error: "Milestone must be submitted before review" };

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, milestone.contractId))
    .limit(1);

  if (!contract || contract.brandProfileId !== brandProfile.id)
    return { error: "Unauthorized" };

  if (parsed.data.action === "approve") {
    await db
      .update(milestones)
      .set({
        status: "approved",
        approvedAt: new Date(),
      })
      .where(eq(milestones.id, milestone.id));

    // Check if all milestones are approved → complete the contract
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.contractId, contract.id));

    const allApproved = allMilestones.every(
      (m) => m.id === milestone.id || m.status === "approved" || m.status === "paid",
    );

    if (allApproved) {
      await db
        .update(contracts)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(contracts.id, contract.id));
    }
  } else {
    await db
      .update(milestones)
      .set({
        status: "revision_requested",
        revisionNotes: parsed.data.revisionNotes ?? null,
      })
      .where(eq(milestones.id, milestone.id));
  }

  revalidatePath(`/contracts/${contract.id}`);
  return { success: true };
}
