import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Users, ExternalLink, Globe, DollarSign } from "lucide-react";
import { getUserWithProfile } from "@/server/queries/profiles";
import { getInfluencerDirectoryProfile } from "@/server/queries/directory";
import type { BrandProfile } from "@/types";

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  threads: "Threads",
};

export default async function InfluencerProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  const data = await getUserWithProfile();
  if (!data || data.role !== "brand") redirect("/dashboard");

  const brandProfile = data.profile as BrandProfile;
  if (brandProfile.subscriptionTier !== "pro") redirect("/directory");

  const result = await getInfluencerDirectoryProfile(profileId);
  if (!result) notFound();

  const { profile, socialAccounts } = result;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-6 animate-fade-in-up">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-violet text-3xl font-bold text-white">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {profile.city && profile.state && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.city}, {profile.state}, {profile.country}
              </span>
            )}
            {profile.totalFollowers && profile.totalFollowers > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {profile.totalFollowers.toLocaleString()} followers
              </span>
            )}
            {profile.primaryNiche && (
              <Badge className="border-violet/20 bg-violet-light text-violet-dark">
                {profile.primaryNiche.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-200">
        <Card className="card-hover">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-violet-light p-2">
              <Users className="size-4 text-violet" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Followers</p>
              <p className="text-lg font-bold">
                {profile.totalFollowers?.toLocaleString() ?? "0"}
              </p>
            </div>
          </CardContent>
        </Card>

        {profile.totalEngagementRate && (
          <Card className="card-hover">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-violet-light p-2">
                <Globe className="size-4 text-violet" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement Rate</p>
                <p className="text-lg font-bold">
                  {profile.totalEngagementRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.minimumRate && (
          <Card className="card-hover">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-violet-light p-2">
                <DollarSign className="size-4 text-violet" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Minimum Rate</p>
                <p className="text-lg font-bold">
                  ${(profile.minimumRate / 100).toFixed(0)} AUD
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Social Accounts */}
      {socialAccounts.length > 0 && (
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle>Social Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialAccounts.map((s) => {
              const colors: Record<string, string> = {
                instagram: "border-pink-200 bg-pink-50 hover:bg-pink-100",
                tiktok: "border-gray-200 bg-gray-50 hover:bg-gray-100",
                youtube: "border-red-200 bg-red-50 hover:bg-red-100",
                twitter: "border-gray-200 bg-gray-50 hover:bg-gray-100",
                linkedin: "border-blue-200 bg-blue-50 hover:bg-blue-100",
                facebook: "border-blue-200 bg-blue-50 hover:bg-blue-100",
              };
              const colorClass = colors[s.platform] ?? "border-border/60 bg-muted/30 hover:bg-muted/50";

              return (
                <a
                  key={s.id}
                  href={s.profileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.01] hover:shadow-sm ${colorClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      {platformNames[s.platform] ?? s.platform}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {s.handle}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {s.followerCount && (
                      <span className="font-semibold">
                        {s.followerCount.toLocaleString()} followers
                      </span>
                    )}
                    {s.engagementRate && (
                      <span className="text-muted-foreground">
                        {s.engagementRate}% ER
                      </span>
                    )}
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </div>
                </a>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Direct Offer CTA */}
      {profile.acceptsDirectOffers && (
        <Card className="border-violet/20 bg-gradient-to-r from-violet-light to-white animate-fade-in-up delay-400">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-semibold">Send a Direct Offer</p>
              <p className="text-sm text-muted-foreground">
                Reach out to {profile.displayName} with a campaign proposal.
              </p>
            </div>
            <Button className="bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5">
              Send Offer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
