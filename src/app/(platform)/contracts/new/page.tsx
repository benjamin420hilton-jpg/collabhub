import { redirect, notFound } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { db } from "@/db";
import { proposals, campaigns, influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateContractForm } from "@/components/contracts/create-contract-form";
import { centsToDollars } from "@/lib/constants";
import type { BrandProfile } from "@/types";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ proposalId?: string }>;
}) {
  const { proposalId } = await searchParams;
  if (!proposalId) redirect("/contracts");

  const data = await getUserWithProfile();
  if (!data || data.role !== "brand" || !data.profile) redirect("/dashboard");

  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal || proposal.status !== "accepted") notFound();

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, proposal.campaignId))
    .limit(1);

  if (!campaign || campaign.brandProfileId !== (data.profile as BrandProfile).id)
    notFound();

  const [influencer] = await db
    .select()
    .from(influencerProfiles)
    .where(eq(influencerProfiles.id, proposal.influencerProfileId))
    .limit(1);

  if (!influencer) notFound();

  const isGifting = campaign.type === "gifting";
  const agreedRate = proposal.proposedRate
    ? centsToDollars(proposal.proposedRate)
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Create Contract</h1>
        <p className="mt-1 text-muted-foreground">
          Set up milestones for <strong>{influencer.displayName}</strong> on{" "}
          <strong>{campaign.title}</strong>
        </p>
      </div>
      <CreateContractForm
        proposalId={proposalId}
        campaignTitle={campaign.title}
        influencerName={influencer.displayName}
        agreedRate={agreedRate}
        isGifting={isGifting}
      />
    </div>
  );
}
