import { db } from "@/db";
import { influencerProfiles, socialAccounts } from "@/db/schema";
import { eq, and, ilike, gte, desc, sql, or } from "drizzle-orm";

export interface DirectoryFilters {
  search?: string;
  niche?: string;
  state?: string;
  minFollowers?: number;
  platform?: string;
}

export async function searchInfluencers(filters: DirectoryFilters) {
  const conditions = [eq(influencerProfiles.isPublic, true)];

  if (filters.search) {
    conditions.push(
      or(
        ilike(influencerProfiles.displayName, `%${filters.search}%`),
        ilike(influencerProfiles.bio, `%${filters.search}%`),
        ilike(influencerProfiles.city, `%${filters.search}%`),
      )!,
    );
  }

  if (filters.niche) {
    conditions.push(
      eq(
        influencerProfiles.primaryNiche,
        filters.niche as typeof influencerProfiles.primaryNiche.enumValues[number],
      ),
    );
  }

  if (filters.state) {
    conditions.push(eq(influencerProfiles.state, filters.state));
  }

  if (filters.minFollowers) {
    conditions.push(
      gte(influencerProfiles.totalFollowers, filters.minFollowers),
    );
  }

  const results = await db
    .select()
    .from(influencerProfiles)
    .where(and(...conditions))
    .orderBy(
      desc(influencerProfiles.isFeatured),
      sql`CASE WHEN ${influencerProfiles.subscriptionTier} = 'pro' THEN 1 ELSE 0 END DESC`,
      desc(influencerProfiles.totalFollowers),
    )
    .limit(50);

  // Get social accounts for each influencer
  const profileIds = results.map((r) => r.id);

  let socials: (typeof socialAccounts.$inferSelect)[] = [];
  if (profileIds.length > 0) {
    socials = await db
      .select()
      .from(socialAccounts)
      .where(
        sql`${socialAccounts.influencerProfileId} IN ${profileIds}`,
      );
  }

  // Filter by platform if specified
  const filteredResults = filters.platform
    ? results.filter((r) =>
        socials.some(
          (s) =>
            s.influencerProfileId === r.id && s.platform === filters.platform,
        ),
      )
    : results;

  return filteredResults.map((profile) => ({
    profile,
    socialAccounts: socials.filter(
      (s) => s.influencerProfileId === profile.id,
    ),
  }));
}

/**
 * Returns a small set of featured/pro creators for the public landing page.
 * No auth required. Prioritises featured → pro → follower count so the
 * showcased creators are the most compelling.
 */
export async function getFeaturedCreatorsForLanding(limit = 6) {
  const profiles = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.isPublic, true))
    .orderBy(
      desc(influencerProfiles.isFeatured),
      sql`CASE WHEN ${influencerProfiles.subscriptionTier} = 'pro' THEN 1 ELSE 0 END DESC`,
      desc(influencerProfiles.totalFollowers),
    )
    .limit(limit);

  if (profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id);
  const socials = await db
    .select()
    .from(socialAccounts)
    .where(sql`${socialAccounts.influencerProfileId} IN ${ids}`);

  return profiles.map((profile) => ({
    profile,
    socialAccounts: socials.filter(
      (s) => s.influencerProfileId === profile.id,
    ),
  }));
}

export async function getInfluencerDirectoryProfile(profileId: string) {
  const [profile] = await db
    .select()
    .from(influencerProfiles)
    .where(
      and(
        eq(influencerProfiles.id, profileId),
        eq(influencerProfiles.isPublic, true),
      ),
    )
    .limit(1);

  if (!profile) return null;

  const socials = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.influencerProfileId, profile.id));

  return { profile, socialAccounts: socials };
}
