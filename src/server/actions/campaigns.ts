"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, brandProfiles, campaigns, campaignDeliverables } from "@/db/schema";
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

  // Gifting campaigns require Pro tier
  if (data.type === "gifting" && profile.subscriptionTier !== "pro") {
    return { error: "Product gifting campaigns require a Pro subscription" };
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
