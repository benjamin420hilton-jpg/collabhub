"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  users,
  brandProfiles,
  campaigns,
  campaignDeliverables,
  notifications,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCampaignSchema,
  type CreateCampaignInput,
} from "@/lib/validators/campaign";
import { dollarsToCents } from "@/lib/constants";

async function getBrandProfileForCurrentUser() {
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

export async function createCampaign(input: CreateCampaignInput) {
  const profile = await getBrandProfileForCurrentUser();

  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid campaign data", issues: parsed.error.issues };
  }

  const data = parsed.data;

  // Gifting and product exchange campaigns require Pro tier
  if (
    (data.type === "gifting" || data.type === "product_exchange") &&
    profile.subscriptionTier !== "pro"
  ) {
    return {
      error: "Product gifting and exchange campaigns require a Pro subscription",
    };
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      brandProfileId: profile.id,
      title: data.title,
      description: data.description,
      type: data.type,
      status: "draft",
      targetPlatform: data.targetPlatform,
      targetNiche: data.targetNiche ?? null,
      targetLocation: data.targetLocation ?? null,
      minFollowerCount: data.minFollowerCount ?? null,
      budgetMin: data.budgetMin != null ? dollarsToCents(data.budgetMin) : null,
      budgetMax: data.budgetMax != null ? dollarsToCents(data.budgetMax) : null,
      applicationDeadline: data.applicationDeadline ?? null,
      campaignStartDate: data.campaignStartDate ?? null,
      campaignEndDate: data.campaignEndDate ?? null,
      giftDescription: data.giftDescription ?? null,
      giftValue: data.giftValue != null ? dollarsToCents(data.giftValue) : null,
      maxApplications: data.maxApplications ?? null,
      expiresAt: data.expiresAt ?? null,
    })
    .returning();

  // Insert deliverables
  if (data.deliverables.length > 0) {
    await db.insert(campaignDeliverables).values(
      data.deliverables.map((d) => ({
        campaignId: campaign.id,
        type: d.type,
        description: d.description ?? null,
        quantity: d.quantity,
        requirements: d.requirements ?? null,
      })),
    );
  }

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export async function publishCampaign(campaignId: string) {
  const profile = await getBrandProfileForCurrentUser();

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.brandProfileId !== profile.id) return { error: "Unauthorized" };
  if (campaign.status !== "draft") return { error: "Campaign is not a draft" };

  // Unverified brands go through review
  if (!profile.verified) {
    await db
      .update(campaigns)
      .set({
        status: "pending_review",
        isPublic: false,
      })
      .where(eq(campaigns.id, campaignId));

    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaignId}`);
    return {
      success: true,
      message:
        "Your campaign has been submitted for review. It will go live once approved.",
    };
  }

  await db
    .update(campaigns)
    .set({
      status: "published",
      isPublic: true,
      publishedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

/**
 * Pause a published campaign — removes it from public listings.
 */
export async function pauseCampaign(campaignId: string) {
  const profile = await getBrandProfileForCurrentUser();

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.brandProfileId !== profile.id) return { error: "Unauthorized" };
  if (campaign.status !== "published")
    return { error: "Only published campaigns can be paused" };

  await db
    .update(campaigns)
    .set({ status: "paused", isPublic: false })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

/**
 * Resume a paused campaign — republishes to public listings.
 */
export async function resumeCampaign(campaignId: string) {
  const profile = await getBrandProfileForCurrentUser();

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.brandProfileId !== profile.id) return { error: "Unauthorized" };
  if (campaign.status !== "paused")
    return { error: "Only paused campaigns can be resumed" };

  await db
    .update(campaigns)
    .set({ status: "published", isPublic: true })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

/**
 * Flag a campaign as offensive or fake. Any authenticated user can flag.
 * Flagged campaigns are hidden from public listings.
 */
export async function flagCampaign(campaignId: string, reason: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.isFlagged) return { error: "Campaign is already flagged" };

  await db
    .update(campaigns)
    .set({
      isFlagged: true,
      flaggedReason: reason,
      isPublic: false,
    })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}
