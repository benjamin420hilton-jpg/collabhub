import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { db } from "@/db";
import { campaigns, brandProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Shield, Clock, Flag } from "lucide-react";
import Link from "next/link";

export default async function AdminCampaignsPage() {
  const data = await getUserWithProfile();
  if (!data) redirect("/sign-in");

  // Fetch pending-review campaigns with brand info
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

  // Fetch flagged campaigns with brand info
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
          <div className="rounded-2xl bg-coral-light p-3">
            <Shield className="size-6 text-coral" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Campaign Review</h1>
            <p className="mt-1 text-muted-foreground">
              Review pending campaigns and investigate flagged content.
            </p>
          </div>
        </div>
      </div>

      {/* Pending Review Section */}
      <section className="space-y-4 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-coral" />
          <h2 className="text-xl font-semibold">Pending Review</h2>
          <Badge className="border-amber-300/50 bg-amber-50 text-amber-700">
            {pendingCampaigns.length}
          </Badge>
        </div>

        {pendingCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-12">
            <div className="rounded-2xl bg-coral-light p-4">
              <Megaphone className="size-8 text-coral" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All caught up</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No campaigns awaiting review right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCampaigns.map(
              ({ campaign, brandName, brandVerified }, i) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                >
                  <Card
                    className="card-hover animate-fade-in-up"
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
                              className="border-teal/30 text-teal-dark text-xs"
                            >
                              Verified
                            </Badge>
                          )}
                        </p>
                      </div>
                      <Badge className="border-amber-300/50 bg-amber-50 text-amber-700">
                        pending review
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Submitted{" "}
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

      {/* Flagged Campaigns Section */}
      <section className="space-y-4 animate-fade-in-up delay-200">
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
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                >
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
                              className="border-teal/30 text-teal-dark text-xs"
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
    </div>
  );
}
