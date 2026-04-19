import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Search as SearchIcon, Sparkles } from "lucide-react";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getPublicCampaigns,
  getBrandCampaigns,
  type CampaignFilters,
} from "@/server/queries/campaigns";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignSearch } from "@/components/campaigns/campaign-search";
import type { BrandProfile, InfluencerProfile } from "@/types";

const statusFilters: Record<string, string[]> = {
  active: ["published", "in_progress"],
  published: ["published"],
  draft: ["draft"],
  completed: ["completed"],
  archived: ["archived"],
};

const filterLabels: Record<string, string> = {
  active: "Active",
  published: "Published",
  draft: "Draft",
  completed: "Completed",
  archived: "Archived",
};

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    niche?: string;
    type?: string;
    platform?: string;
    minBudget?: string;
  }>;
}) {
  const params = await searchParams;
  const { status } = params;
  const data = await getUserWithProfile();
  const isBrand = data?.role === "brand";

  const allBrandCampaigns = isBrand && data.profile
    ? await getBrandCampaigns((data.profile as BrandProfile).id)
    : null;

  const campaignResults =
    allBrandCampaigns && status && statusFilters[status]
      ? allBrandCampaigns.filter((c) => statusFilters[status].includes(c.status))
      : allBrandCampaigns;

  const viewerTier =
    data?.role === "influencer"
      ? ((data.profile as InfluencerProfile).subscriptionTier ?? "free")
      : "free";
  const campaignFilters: CampaignFilters = {
    search: params.search || undefined,
    niche: params.niche || undefined,
    type: params.type || undefined,
    platform: params.platform || undefined,
    minBudget: params.minBudget ? Number(params.minBudget) : undefined,
  };
  const publicCampaigns = !isBrand
    ? await getPublicCampaigns(viewerTier, campaignFilters)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isBrand
              ? status && filterLabels[status]
                ? `${filterLabels[status]} Campaigns`
                : "Your Campaigns"
              : "Campaign Board"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isBrand
              ? "Manage your campaign briefs."
              : "Browse available campaigns and submit proposals."}
          </p>
          {isBrand && status && filterLabels[status] && (
            <Link
              href="/campaigns"
              className="mt-2 inline-block text-sm text-coral hover:underline"
            >
              Show all campaigns
            </Link>
          )}
        </div>
        {isBrand && (
          <Link href="/campaigns/new">
            <Button>
              <Plus className="mr-2 size-4" /> New Campaign
            </Button>
          </Link>
        )}
      </div>

      {/* Brand's own campaigns */}
      {isBrand && campaignResults && (
        <div className="space-y-4">
          {campaignResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <Megaphone className="size-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first campaign to start receiving proposals.
              </p>
              <Link href="/campaigns/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 size-4" /> Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            campaignResults.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                brandName="Your Campaign"
              />
            ))
          )}
        </div>
      )}

      {/* Public job board for influencers */}
      {!isBrand && publicCampaigns && (
        <div className="space-y-4">
          {viewerTier === "free" && (
            <div className="flex items-start gap-3 rounded-xl border border-coral/20 bg-coral-light/40 p-4 text-sm">
              <Sparkles className="size-4 shrink-0 text-coral mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Pro creators see new campaigns 24h early</p>
                <p className="text-muted-foreground">
                  Upgrade to Pro and get first pick on every new brief that lands.
                </p>
              </div>
              <Link href="/settings/billing">
                <Button size="sm" className="bg-gradient-primary text-white shadow-sm">
                  Upgrade
                </Button>
              </Link>
            </div>
          )}

          <CampaignSearch filters={campaignFilters} />

          {publicCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              {Object.values(campaignFilters).some(Boolean) ? (
                <>
                  <SearchIcon className="size-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No campaigns match your filters
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search terms or clearing a filter.
                  </p>
                </>
              ) : (
                <>
                  <Megaphone className="size-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check back soon — new campaigns are posted regularly.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {publicCampaigns.length} campaign
                {publicCampaigns.length !== 1 ? "s" : ""} available
              </p>
              {publicCampaigns.map(({ campaign, brandName }) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  brandName={brandName}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
