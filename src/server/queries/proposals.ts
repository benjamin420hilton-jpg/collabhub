import { db } from "@/db";
import { proposals, influencerProfiles, campaigns, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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
