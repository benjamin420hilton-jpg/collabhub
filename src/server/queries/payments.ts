import { db } from "@/db";
import {
  payments,
  contracts,
  proposals,
  campaigns,
  brandProfiles,
  influencerProfiles,
} from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

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
