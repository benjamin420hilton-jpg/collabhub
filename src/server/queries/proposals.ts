import { db } from "@/db";
import { proposals, influencerProfiles, campaigns } from "@/db/schema";
import { eq, and, desc, gte, sql, count } from "drizzle-orm";

export const FREE_TIER_MONTHLY_PROPOSAL_LIMIT = 5;

/**
 * Count proposals the influencer has submitted since the first of the
 * current month. Used to enforce the free-tier 5/month cap.
 */
export async function getMonthlyProposalCount(influencerProfileId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(proposals)
    .where(
      and(
        eq(proposals.influencerProfileId, influencerProfileId),
        gte(proposals.createdAt, sql`date_trunc('month', NOW())`),
      ),
    );
  return row?.count ?? 0;
}

export async function getProposalsForCampaign(campaignId: string) {
  const results = await db
    .select({
      proposal: proposals,
      influencerName: influencerProfiles.displayName,
      influencerNiche: influencerProfiles.primaryNiche,
      influencerFollowers: influencerProfiles.totalFollowers,
      influencerCity: influencerProfiles.city,
      influencerState: influencerProfiles.state,
    })
    .from(proposals)
    .innerJoin(
      influencerProfiles,
      eq(proposals.influencerProfileId, influencerProfiles.id),
    )
    .where(eq(proposals.campaignId, campaignId))
    .orderBy(desc(proposals.createdAt));

  return results;
}

export async function getProposalsForInfluencer(influencerProfileId: string) {
  const results = await db
    .select({
      proposal: proposals,
      campaignTitle: campaigns.title,
      campaignType: campaigns.type,
      campaignStatus: campaigns.status,
    })
    .from(proposals)
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .where(eq(proposals.influencerProfileId, influencerProfileId))
    .orderBy(desc(proposals.createdAt));

  return results;
}

export async function getExistingProposal(
  campaignId: string,
  influencerProfileId: string,
) {
  const [existing] = await db
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.campaignId, campaignId),
        eq(proposals.influencerProfileId, influencerProfileId),
      ),
    )
    .limit(1);

  return existing ?? null;
}

export async function getProposalsForBrand(brandProfileId: string) {
  const results = await db
    .select({
      proposal: proposals,
      campaignTitle: campaigns.title,
      campaignStatus: campaigns.status,
      influencerName: influencerProfiles.displayName,
      influencerProfileId: influencerProfiles.id,
    })
    .from(proposals)
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(
      influencerProfiles,
      eq(proposals.influencerProfileId, influencerProfiles.id),
    )
    .where(eq(campaigns.brandProfileId, brandProfileId))
    .orderBy(desc(proposals.createdAt));

  return results;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

type ProposalStatus =
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface ProposalHistogramRow {
  month: string;
  pending: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  expired: number;
}

export async function getProposalStatusHistogram(
  ownerId: string,
  role: "brand" | "influencer",
): Promise<ProposalHistogramRow[]> {
  const since = monthsAgo(11);

  const rows =
    role === "brand"
      ? await db
          .select({
            month: sql<string>`to_char(date_trunc('month', ${proposals.createdAt}), 'YYYY-MM')`,
            status: proposals.status,
            count: sql<number>`COUNT(*)::int`,
          })
          .from(proposals)
          .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
          .where(
            and(
              eq(campaigns.brandProfileId, ownerId),
              gte(proposals.createdAt, since),
            ),
          )
          .groupBy(
            sql`date_trunc('month', ${proposals.createdAt})`,
            proposals.status,
          )
      : await db
          .select({
            month: sql<string>`to_char(date_trunc('month', ${proposals.createdAt}), 'YYYY-MM')`,
            status: proposals.status,
            count: sql<number>`COUNT(*)::int`,
          })
          .from(proposals)
          .where(
            and(
              eq(proposals.influencerProfileId, ownerId),
              gte(proposals.createdAt, since),
            ),
          )
          .groupBy(
            sql`date_trunc('month', ${proposals.createdAt})`,
            proposals.status,
          );

  const byMonth = new Map<string, ProposalHistogramRow>();
  const blank = (month: string): ProposalHistogramRow => ({
    month,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    expired: 0,
  });

  for (const r of rows) {
    const bucket = byMonth.get(r.month) ?? blank(r.month);
    bucket[r.status as ProposalStatus] = r.count;
    byMonth.set(r.month, bucket);
  }

  const result: ProposalHistogramRow[] = [];
  const cursor = new Date(since);
  const now = new Date();
  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push(byMonth.get(key) ?? blank(key));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}
