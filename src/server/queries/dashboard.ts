import { db } from "@/db";
import { campaigns, contracts, proposals } from "@/db/schema";
import { eq, and, count, inArray } from "drizzle-orm";

export async function getBrandDashboardStats(brandProfileId: string) {
  const [campaignStats] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.brandProfileId, brandProfileId),
        inArray(campaigns.status, ["published", "in_progress"]),
      ),
    );

  const [contractStats] = await db
    .select({ count: count() })
    .from(contracts)
    .where(
      and(
        eq(contracts.brandProfileId, brandProfileId),
        inArray(contracts.status, ["pending_escrow", "escrow_funded", "active"]),
      ),
    );

  return {
    activeCampaigns: campaignStats?.count ?? 0,
    activeContracts: contractStats?.count ?? 0,
  };
}

export async function getInfluencerDashboardStats(
  influencerProfileId: string,
) {
  const [contractStats] = await db
    .select({ count: count() })
    .from(contracts)
    .where(
      and(
        eq(contracts.influencerProfileId, influencerProfileId),
        inArray(contracts.status, ["pending_escrow", "escrow_funded", "active"]),
      ),
    );

  const [proposalStats] = await db
    .select({ count: count() })
    .from(proposals)
    .where(
      and(
        eq(proposals.influencerProfileId, influencerProfileId),
        eq(proposals.status, "pending"),
      ),
    );

  return {
    activeContracts: contractStats?.count ?? 0,
    pendingProposals: proposalStats?.count ?? 0,
  };
}
