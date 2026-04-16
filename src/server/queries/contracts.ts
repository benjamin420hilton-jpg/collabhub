import { db } from "@/db";
import {
  contracts,
  milestones,
  proposals,
  campaigns,
  brandProfiles,
  influencerProfiles,
} from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";

export async function getContractById(contractId: string) {
  const [result] = await db
    .select({
      contract: contracts,
      campaignTitle: campaigns.title,
      brandName: brandProfiles.companyName,
      brandProfileId: brandProfiles.id,
      influencerName: influencerProfiles.displayName,
      influencerProfileId: influencerProfiles.id,
    })
    .from(contracts)
    .innerJoin(proposals, eq(contracts.proposalId, proposals.id))
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(brandProfiles, eq(contracts.brandProfileId, brandProfiles.id))
    .innerJoin(
      influencerProfiles,
      eq(contracts.influencerProfileId, influencerProfiles.id),
    )
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!result) return null;

  const contractMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.contractId, contractId))
    .orderBy(milestones.sortOrder);

  return { ...result, milestones: contractMilestones };
}

export async function getContractsForBrand(brandProfileId: string) {
  const results = await db
    .select({
      contract: contracts,
      campaignTitle: campaigns.title,
      influencerName: influencerProfiles.displayName,
    })
    .from(contracts)
    .innerJoin(proposals, eq(contracts.proposalId, proposals.id))
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(
      influencerProfiles,
      eq(contracts.influencerProfileId, influencerProfiles.id),
    )
    .where(eq(contracts.brandProfileId, brandProfileId))
    .orderBy(desc(contracts.createdAt));

  return results;
}

export async function getContractsForInfluencer(influencerProfileId: string) {
  const results = await db
    .select({
      contract: contracts,
      campaignTitle: campaigns.title,
      brandName: brandProfiles.companyName,
    })
    .from(contracts)
    .innerJoin(proposals, eq(contracts.proposalId, proposals.id))
    .innerJoin(campaigns, eq(proposals.campaignId, campaigns.id))
    .innerJoin(brandProfiles, eq(contracts.brandProfileId, brandProfiles.id))
    .where(eq(contracts.influencerProfileId, influencerProfileId))
    .orderBy(desc(contracts.createdAt));

  return results;
}
