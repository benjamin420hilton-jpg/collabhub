import { db } from "@/db";
import {
  payments,
  contracts,
  proposals,
  campaigns,
  brandProfiles,
  influencerProfiles,
} from "@/db/schema";
import { eq, desc, and, inArray, gte, sql } from "drizzle-orm";

export async function getPaymentsForContract(contractId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.contractId, contractId))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentsForBrand(brandProfileId: string) {
  return db
    .select({
      payment: payments,
      campaignTitle: campaigns.title,
      influencerName: influencerProfiles.displayName,
    })
    .from(payments)
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .innerJoin(proposals, eq(contracts.proposalId, proposals.id))
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(
      influencerProfiles,
      eq(contracts.influencerProfileId, influencerProfiles.id),
    )
    .where(eq(contracts.brandProfileId, brandProfileId))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentsForInfluencer(influencerProfileId: string) {
  return db
    .select({
      payment: payments,
      campaignTitle: campaigns.title,
      brandName: brandProfiles.companyName,
    })
    .from(payments)
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .innerJoin(proposals, eq(contracts.proposalId, proposals.id))
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(brandProfiles, eq(contracts.brandProfileId, brandProfiles.id))
    .where(
      and(
        eq(contracts.influencerProfileId, influencerProfileId),
        inArray(payments.type, ["milestone_release", "platform_fee"]),
      ),
    )
    .orderBy(desc(payments.createdAt));
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getEarningsByMonth(influencerProfileId: string) {
  const since = monthsAgo(11);
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${payments.createdAt}), 'YYYY-MM')`,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int`,
    })
    .from(payments)
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .where(
      and(
        eq(contracts.influencerProfileId, influencerProfileId),
        eq(payments.type, "milestone_release"),
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, since),
      ),
    )
    .groupBy(sql`date_trunc('month', ${payments.createdAt})`)
    .orderBy(sql`date_trunc('month', ${payments.createdAt})`);

  return fillMonthlyGaps(rows, since);
}

export async function getSpendingByMonth(brandProfileId: string) {
  const since = monthsAgo(11);
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${payments.createdAt}), 'YYYY-MM')`,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int`,
    })
    .from(payments)
    .innerJoin(contracts, eq(payments.contractId, contracts.id))
    .where(
      and(
        eq(contracts.brandProfileId, brandProfileId),
        eq(payments.type, "escrow_hold"),
        eq(payments.status, "succeeded"),
        gte(payments.createdAt, since),
      ),
    )
    .groupBy(sql`date_trunc('month', ${payments.createdAt})`)
    .orderBy(sql`date_trunc('month', ${payments.createdAt})`);

  return fillMonthlyGaps(rows, since);
}

function fillMonthlyGaps(
  rows: { month: string; total: number }[],
  since: Date,
): { month: string; total: number }[] {
  const byMonth = new Map(rows.map((r) => [r.month, r.total]));
  const result: { month: string; total: number }[] = [];
  const cursor = new Date(since);
  const now = new Date();

  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month: key, total: byMonth.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return result;
}
