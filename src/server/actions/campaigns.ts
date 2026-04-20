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
import { requireAdmin } from "@/lib/auth/admin";

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

  // Campaigns auto-publish — content moderation runs at create time via the
  // validator's profanity check. Abuse is handled reactively through the
  // flag-and-review flow on /admin/campaigns (still wired up for flagged
  // campaigns) rather than as a pre-publish gate.
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
 * Admin: approve a pending-review campaign. Publishes it and notifies the brand.
 */
export async function approveCampaign(campaignId: string) {
  await requireAdmin();

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.status !== "pending_review")
    return { error: "Campaign is not awaiting review" };

  await db
    .update(campaigns)
    .set({
      status: "published",
      isPublic: true,
      publishedAt: new Date(),
      reviewedAt: new Date(),
      rejectionReason: null,
    })
    .where(eq(campaigns.id, campaignId));

  const [brand] = await db
    .select({ userId: brandProfiles.userId })
    .from(brandProfiles)
    .where(eq(brandProfiles.id, campaign.brandProfileId))
    .limit(1);

  if (brand) {
    await db.insert(notifications).values({
      userId: brand.userId,
      type: "campaign_approved",
      title: "Campaign approved",
      message: `"${campaign.title}" is now live on the campaign board.`,
      link: `/campaigns/${campaign.id}`,
    });
  }

  revalidatePath("/admin/campaigns");
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

/**
 * Admin: reject a pending-review campaign with a reason. Notifies the brand.
 */
export async function rejectCampaign(campaignId: string, reason: string) {
  await requireAdmin();

  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { error: "Please provide a rejection reason (at least 10 chars)" };
  }

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) return { error: "Campaign not found" };
  if (campaign.status !== "pending_review")
    return { error: "Campaign is not awaiting review" };

  await db
    .update(campaigns)
    .set({
      status: "rejected",
      isPublic: false,
      rejectionReason: trimmed,
      reviewedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  const [brand] = await db
    .select({ userId: brandProfiles.userId })
    .from(brandProfiles)
    .where(eq(brandProfiles.id, campaign.brandProfileId))
    .limit(1);

  if (brand) {
    await db.insert(notifications).values({
      userId: brand.userId,
      type: "campaign_rejected",
      title: "Campaign needs changes",
      message: `"${campaign.title}" was not approved. Reason: ${trimmed.slice(0, 140)}`,
      link: `/campaigns/${campaign.id}`,
    });
  }

  revalidatePath("/admin/campaigns");
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
