import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users, Calendar, DollarSign, Gift } from "lucide-react";
import { getCampaignById } from "@/server/queries/campaigns";
import { getUserWithProfile } from "@/server/queries/profiles";
import { getProposalsForCampaign, getExistingProposal } from "@/server/queries/proposals";
import { centsToDollars } from "@/lib/constants";
import { PublishCampaignButton } from "@/components/campaigns/publish-campaign-button";
import { ApplyCampaignForm } from "@/components/campaigns/apply-campaign-form";
import { ProposalList } from "@/components/campaigns/proposal-list";
import type { BrandProfile, InfluencerProfile } from "@/types";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const result = await getCampaignById(campaignId);
  if (!result) notFound();

  const { campaign, brandName, brandCity, brandState, deliverables } = result;
  const data = await getUserWithProfile();

  const isBrandOwner =
    data?.role === "brand" &&
    data.profile &&
    (data.profile as BrandProfile).id === campaign.brandProfileId;

  const isInfluencer = data?.role === "influencer";

  // Check if influencer already applied
  let hasApplied = false;
  if (isInfluencer && data.profile) {
    const existing = await getExistingProposal(
      campaignId,
      (data.profile as InfluencerProfile).id,
    );
    hasApplied = !!existing;
  }

  // Get proposals for brand owner
  const proposalResults = isBrandOwner
    ? await getProposalsForCampaign(campaignId)
    : null;

  const budgetDisplay =
    campaign.type === "gifting"
      ? null
      : campaign.budgetMin && campaign.budgetMax
        ? `$${centsToDollars(campaign.budgetMin)} – $${centsToDollars(campaign.budgetMax)} AUD`
        : campaign.budgetMax
          ? `Up to $${centsToDollars(campaign.budgetMax)} AUD`
          : campaign.budgetMin
            ? `From $${centsToDollars(campaign.budgetMin)} AUD`
            : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge
              variant={campaign.status === "published" ? "default" : "secondary"}
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            by {brandName}
            {brandCity && brandState && ` · ${brandCity}, ${brandState}`}
          </p>
        </div>
        {isBrandOwner && campaign.status === "draft" && (
          <PublishCampaignButton campaignId={campaign.id} />
        )}
      </div>

      {/* Key Info */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary" className="text-sm">
          {campaign.targetPlatform}
        </Badge>
        {campaign.type === "gifting" && (
          <Badge variant="outline" className="text-sm">
            <Gift className="mr-1 size-3" /> Product Gifting
          </Badge>
        )}
        {campaign.targetNiche && (
          <Badge variant="outline" className="text-sm">
            {campaign.targetNiche.replace("_", " ")}
          </Badge>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{campaign.description}</p>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {budgetDisplay && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <DollarSign className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">{budgetDisplay}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {campaign.type === "gifting" && campaign.giftDescription && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Gift className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Gift</p>
                <p className="font-semibold">{campaign.giftDescription}</p>
                {campaign.giftValue && (
                  <p className="text-sm text-muted-foreground">
                    Valued at ${centsToDollars(campaign.giftValue)} AUD
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {campaign.targetLocation && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <MapPin className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{campaign.targetLocation}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {campaign.minFollowerCount && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Users className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Min Followers</p>
                <p className="font-semibold">
                  {campaign.minFollowerCount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {campaign.applicationDeadline && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Calendar className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-semibold">
                  {new Date(campaign.applicationDeadline).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliverables.map((d, i) => (
              <div key={d.id}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {d.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    {d.requirements && (
                      <p className="text-sm text-muted-foreground">
                        {d.requirements}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">x{d.quantity}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Apply form for influencers */}
      {isInfluencer && campaign.status === "published" && (
        <ApplyCampaignForm
          campaignId={campaign.id}
          brandName={brandName}
          hasApplied={hasApplied}
        />
      )}

      {/* Proposals for brand owners */}
      {isBrandOwner && proposalResults && (
        <ProposalList proposals={proposalResults} />
      )}
    </div>
  );
}
