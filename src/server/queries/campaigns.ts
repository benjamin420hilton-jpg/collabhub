import { db } from "@/db";
import {
  campaigns,
  campaignDeliverables,
  brandProfiles,
} from "@/db/schema";
import { eq, and, desc, lte, sql } from "drizzle-orm";

/**
 * Public campaign board. Pro creators see every published campaign the
 * moment it goes live; free creators see campaigns that were published
 * at least 24h ago. This 24h head start is one of the Pro perks.
 */
export async function getPublicCampaigns(viewerTier: "free" | "pro" = "free") {
  const conditions = [
    eq(campaigns.isPublic, true),
    eq(campaigns.status, "published"),
  ];

  if (viewerTier === "free") {
    conditions.push(
      lte(campaigns.publishedAt, sql`NOW() - INTERVAL '24 hours'`),
    );
  }

  const results = await db
    .select({
      campaign: campaigns,
      brandName: brandProfiles.companyName,
      brandLogo: brandProfiles.logoUrl,
    })
    .from(campaigns)
    .innerJoin(brandProfiles, eq(campaigns.brandProfileId, brandProfiles.id))
    .where(and(...conditions))
    .orderBy(desc(campaigns.publishedAt));

  return results;
}

export async function getCampaignById(campaignId: string) {
  const [result] = await db
    .select({
      campaign: campaigns,
      brandName: brandProfiles.companyName,
      brandLogo: brandProfiles.logoUrl,
      brandCity: brandProfiles.city,
      brandState: brandProfiles.state,
    })
    .from(campaigns)
    .innerJoin(brandProfiles, eq(campaigns.brandProfileId, brandProfiles.id))
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!result) return null;

  const deliverables = await db
    .select()
    .from(campaignDeliverables)
    .where(eq(campaignDeliverables.campaignId, campaignId));

  return { ...result, deliverables };
}

export async function getBrandCampaigns(brandProfileId: string) {
  const results = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.brandProfileId, brandProfileId))
    .orderBy(desc(campaigns.createdAt));

  return results;
}

export async function getCampaignCountForBrand(brandProfileId: string) {
  const results = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.brandProfileId, brandProfileId),
        eq(campaigns.status, "published"),
      ),
    );

  return results.length;
}
