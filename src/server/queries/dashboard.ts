import { db } from "@/db";
import { campaigns, contracts, proposals, milestones, payments } from "@/db/schema";
import { eq, and, count, inArray, desc, sql } from "drizzle-orm";

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

  const [totalCampaigns] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(eq(campaigns.brandProfileId, brandProfileId));

  const [pendingProposals] = await db
    .select({ count: count() })
    .from(proposals)
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .where(
      and(
        eq(campaigns.brandProfileId, brandProfileId),
        eq(proposals.status, "pending"),
      ),
    );

  const [completedContracts] = await db
    .select({ count: count() })
    .from(contracts)
    .where(
      and(
        eq(contracts.brandProfileId, brandProfileId),
        eq(contracts.status, "completed"),
      ),
    );

  // Recent proposals
  const recentProposals = await db
    .select({
      proposalId: proposals.id,
      campaignTitle: campaigns.title,
      proposalStatus: proposals.status,
      proposedRate: proposals.proposedRate,
      createdAt: proposals.createdAt,
    })
    .from(proposals)
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .where(eq(campaigns.brandProfileId, brandProfileId))
    .orderBy(desc(proposals.createdAt))
    .limit(5);

  return {
    activeCampaigns: campaignStats?.count ?? 0,
    activeContracts: contractStats?.count ?? 0,
    totalCampaigns: totalCampaigns?.count ?? 0,
    pendingProposals: pendingProposals?.count ?? 0,
    completedContracts: completedContracts?.count ?? 0,
    recentProposals,
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

  const [totalProposals] = await db
    .select({ count: count() })
    .from(proposals)
    .where(eq(proposals.influencerProfileId, influencerProfileId));

  const [acceptedProposals] = await db
    .select({ count: count() })
    .from(proposals)
    .where(
      and(
        eq(proposals.influencerProfileId, influencerProfileId),
        eq(proposals.status, "accepted"),
      ),
    );

  const [completedContracts] = await db
    .select({ count: count() })
    .from(contracts)
    .where(
      and(
        eq(contracts.influencerProfileId, influencerProfileId),
        eq(contracts.status, "completed"),
      ),
    );

  // Earnings from completed milestones
  const earnings = await db
    .select({ total: sql<number>`COALESCE(SUM(${milestones.amount}), 0)` })
    .from(milestones)
    .innerJoin(contracts, eq(milestones.contractId, contracts.id))
    .where(
      and(
        eq(contracts.influencerProfileId, influencerProfileId),
        inArray(milestones.status, ["approved", "paid"]),
      ),
    );

  // Recent activity
  const recentProposals = await db
    .select({
      proposalId: proposals.id,
      campaignTitle: campaigns.title,
      proposalStatus: proposals.status,
      createdAt: proposals.createdAt,
    })
    .from(proposals)
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .where(eq(proposals.influencerProfileId, influencerProfileId))
    .orderBy(desc(proposals.createdAt))
    .limit(5);

  return {
    activeContracts: contractStats?.count ?? 0,
    pendingProposals: proposalStats?.count ?? 0,
    totalProposals: totalProposals?.count ?? 0,
    acceptedProposals: acceptedProposals?.count ?? 0,
    completedContracts: completedContracts?.count ?? 0,
    totalEarnings: Number(earnings[0]?.total ?? 0),
    recentProposals,
  };
}
