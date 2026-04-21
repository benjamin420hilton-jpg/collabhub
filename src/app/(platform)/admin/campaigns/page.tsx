import { notFound } from "next/navigation";
import { db } from "@/db";
import { campaigns, brandProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Megaphone,
  Shield,
  Clock,
  Flag,
  ExternalLink,
  DollarSign,
  Target,
} from "lucide-react";
import Link from "next/link";
import { getCurrentAdminClerkId } from "@/lib/auth/admin";
import { CampaignReviewActions } from "@/components/admin/campaign-review-actions";
import { centsToDollars } from "@/lib/constants";

function formatBudget(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null)
    return `$${centsToDollars(min).toLocaleString()} – $${centsToDollars(max).toLocaleString()}`;
  if (min != null) return `From $${centsToDollars(min).toLocaleString()}`;
  if (max != null) return `Up to $${centsToDollars(max!).toLocaleString()}`;
  return null;
}

export default async function AdminCampaignsPage() {
  const adminClerkId = await getCurrentAdminClerkId();
  if (!adminClerkId) notFound();

  const pendingCampaigns = await db
    .select({
      campaign: campaigns,
      brandName: brandProfiles.companyName,
      brandVerified: brandProfiles.verified,
    })
    .from(campaigns)
    .innerJoin(brandProfiles, eq(campaigns.brandProfileId, brandProfiles.id))
    .where(eq(campaigns.status, "pending_review"))
    .orderBy(desc(campaigns.createdAt));

  const flaggedCampaigns = await db
    .select({
      campaign: campaigns,
      brandName: brandProfiles.companyName,
      brandVerified: brandProfiles.verified,
    })
    .from(campaigns)
    .innerJoin(brandProfiles, eq(campaigns.brandProfileId, brandProfiles.id))
    .where(eq(campaigns.isFlagged, true))
    .orderBy(desc(campaigns.updatedAt));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-light p-3">
            <Shield className="size-6 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Moderation</h1>
            <p className="mt-1 text-muted-foreground">
              Campaigns auto-publish with automated content checks. This page
              handles the exceptions — campaigns flagged by users and any
              legacy drafts awaiting review.
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Section — primary surface now */}
      <section className="space-y-4 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2">
          <Flag className="size-5 text-destructive" />
          <h2 className="text-xl font-semibold">Flagged Campaigns</h2>
          <Badge className="border-red-300/50 bg-red-50 text-red-700">
            {flaggedCampaigns.length}
          </Badge>
        </div>

        {flaggedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-12">
            <div className="rounded-2xl bg-green-50 p-4">
              <Shield className="size-8 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No flagged campaigns</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No campaigns have been reported by users.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedCampaigns.map(
              ({ campaign, brandName, brandVerified }, i) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card
                    className="card-hover animate-fade-in-up border-red-200/50"
                    style={{ animationDelay: `${(i + 2) * 80}ms` }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">
                          {campaign.title}
                        </CardTitle>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          {brandName}
                          {brandVerified && (
                            <Badge
                              variant="outline"
                              className="border-highlight/30 text-highlight-dark text-xs"
                            >
                              Verified
                            </Badge>
                          )}
                        </p>
                      </div>
                      <Badge className="border-red-300/50 bg-red-50 text-red-700">
                        flagged
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {campaign.flaggedReason && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          <Flag className="mt-0.5 size-3.5 shrink-0" />
                          <span>{campaign.flaggedReason}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {new Date(campaign.createdAt).toLocaleDateString(
                          "en-AU",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ),
            )}
          </div>
        )}
      </section>

      {/* Pending Review — legacy/fallback, now dormant */}
      <section className="space-y-4 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            Awaiting Review
          </h2>
          <Badge className="border-amber-300/50 bg-amber-50 text-amber-700">
            {pendingCampaigns.length}
          </Badge>
          <span className="text-xs text-muted-foreground/70">
            (dormant — new campaigns auto-publish)
          </span>
        </div>

        {pendingCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here — this queue is only used if we re-enable pre-publish
            review for a specific brand.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingCampaigns.map(
              ({ campaign, brandName, brandVerified }, i) => {
                const budget = formatBudget(
                  campaign.budgetMin,
                  campaign.budgetMax,
                );
                return (
                  <Card
                    key={campaign.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(i + 2) * 80}ms` }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {campaign.title}
                        </CardTitle>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {brandName}
                          {brandVerified && (
                            <Badge
                              variant="outline"
                              className="border-highlight/30 text-highlight-dark text-xs"
                            >
                              Verified
                            </Badge>
                          )}
                          <span className="text-muted-foreground/60">·</span>
                          <span>
                            Submitted{" "}
                            {new Date(campaign.createdAt).toLocaleDateString(
                              "en-AU",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </p>
                      </div>
                      <Badge className="border-amber-300/50 bg-amber-50 text-amber-700 shrink-0">
                        pending review
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm whitespace-pre-wrap text-foreground/90">
                        {campaign.description.length > 400
                          ? `${campaign.description.slice(0, 400)}…`
                          : campaign.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                          <Target className="size-3" />
                          {campaign.type.replace("_", " ")}
                        </Badge>
                        {campaign.targetPlatform && (
                          <Badge variant="outline">
                            {campaign.targetPlatform}
                          </Badge>
                        )}
                        {campaign.targetNiche && (
                          <Badge variant="outline">
                            {campaign.targetNiche.replace("_", " ")}
                          </Badge>
                        )}
                        {budget && (
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="size-3" />
                            {budget}
                          </Badge>
                        )}
                        {campaign.minFollowerCount && (
                          <Badge variant="outline">
                            {campaign.minFollowerCount.toLocaleString()}+
                            followers
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="size-3.5" />
                          View full campaign
                        </Link>
                        <CampaignReviewActions campaignId={campaign.id} />
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </section>

    </div>
  );
}
