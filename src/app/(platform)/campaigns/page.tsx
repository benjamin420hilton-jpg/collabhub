import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { getUserWithProfile } from "@/server/queries/profiles";
import { getPublicCampaigns, getBrandCampaigns } from "@/server/queries/campaigns";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import type { BrandProfile } from "@/types";

export default async function CampaignsPage() {
  const data = await getUserWithProfile();
  const isBrand = data?.role === "brand";

  // Brands see their own campaigns, influencers see the public job board
  const campaignResults = isBrand && data.profile
    ? await getBrandCampaigns((data.profile as BrandProfile).id)
    : null;

  const publicCampaigns = !isBrand ? await getPublicCampaigns() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isBrand ? "Your Campaigns" : "Campaign Board"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isBrand
              ? "Manage your campaign briefs."
              : "Browse available campaigns and submit proposals."}
          </p>
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
          {publicCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <Megaphone className="size-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon — new campaigns are posted regularly.
              </p>
            </div>
          ) : (
            publicCampaigns.map(({ campaign, brandName }) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                brandName={brandName}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
