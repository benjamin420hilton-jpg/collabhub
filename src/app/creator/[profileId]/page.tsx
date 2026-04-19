import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Users, Globe, DollarSign, ExternalLink, Mail, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ProBadge, FeaturedBadge } from "@/components/ui/pro-badge";
import { getInfluencerDirectoryProfile } from "@/server/queries/directory";

const platformConfig: Record<string, { name: string; color: string; bg: string }> = {
  instagram: { name: "Instagram", color: "text-pink-600", bg: "bg-pink-50 border-pink-200 hover:bg-pink-100" },
  tiktok: { name: "TikTok", color: "text-gray-900", bg: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
  youtube: { name: "YouTube", color: "text-red-600", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
  twitter: { name: "Twitter/X", color: "text-gray-900", bg: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
  linkedin: { name: "LinkedIn", color: "text-blue-600", bg: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  facebook: { name: "Facebook", color: "text-blue-500", bg: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  pinterest: { name: "Pinterest", color: "text-red-500", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
  snapchat: { name: "Snapchat", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
  threads: { name: "Threads", color: "text-gray-900", bg: "bg-gray-50 border-gray-200 hover:bg-gray-100" },
};

export default async function PublicMediaKitPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const result = await getInfluencerDirectoryProfile(profileId);
  if (!result) notFound();

  const { profile, socialAccounts } = result;
  const totalFollowers = socialAccounts.reduce(
    (sum, s) => sum + (s.followerCount ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-gradient-primary">
            CollabHub
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-gradient-primary text-white shadow-sm">
              Work with {profile.displayName.split(" ")[0]}
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Profile header */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-primary text-4xl font-bold text-white shadow-lg shadow-coral/20">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <h1 className="text-4xl font-extrabold">{profile.displayName}</h1>
            {profile.isFeatured && <FeaturedBadge size="md" />}
            {profile.subscriptionTier === "pro" && <ProBadge size="md" />}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-muted-foreground">
            {profile.primaryNiche && (
              <Badge className="border-coral/20 bg-coral-light text-coral-dark text-sm">
                {profile.primaryNiche.replace("_", " ")}
              </Badge>
            )}
            {profile.city && profile.state && (
              <span className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-3.5" />
                {profile.city}, {profile.state}, {profile.country}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="mx-auto mt-6 max-w-xl text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up delay-100">
          <Card className="card-hover text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto size-5 text-coral" />
              <p className="mt-2 text-2xl font-bold">
                {totalFollowers >= 1000
                  ? `${(totalFollowers / 1000).toFixed(1)}K`
                  : totalFollowers}
              </p>
              <p className="text-xs text-muted-foreground">Total Followers</p>
            </CardContent>
          </Card>
          <Card className="card-hover text-center">
            <CardContent className="pt-6">
              <Globe className="mx-auto size-5 text-coral" />
              <p className="mt-2 text-2xl font-bold">
                {socialAccounts.length}
              </p>
              <p className="text-xs text-muted-foreground">Platforms</p>
            </CardContent>
          </Card>
          {profile.totalEngagementRate && (
            <Card className="card-hover text-center">
              <CardContent className="pt-6">
                <Users className="mx-auto size-5 text-coral" />
                <p className="mt-2 text-2xl font-bold">
                  {profile.totalEngagementRate}%
                </p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </CardContent>
            </Card>
          )}
          {profile.minimumRate && (
            <Card className="card-hover text-center">
              <CardContent className="pt-6">
                <DollarSign className="mx-auto size-5 text-coral" />
                <p className="mt-2 text-2xl font-bold">
                  ${(profile.minimumRate / 100).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Starting Rate</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Social accounts */}
        {socialAccounts.length > 0 && (
          <div className="mt-12 animate-fade-in-up delay-200">
            <h2 className="text-center text-lg font-semibold mb-6">Platforms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialAccounts.map((s) => {
                const config = platformConfig[s.platform] ?? {
                  name: s.platform,
                  color: "text-gray-600",
                  bg: "bg-gray-50 border-gray-200",
                };
                return (
                  <a
                    key={s.id}
                    href={s.profileUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:scale-[1.02] hover:shadow-sm ${config.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-bold ${config.color}`}>
                        {config.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {s.handle}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {s.followerCount && (
                        <span className="font-semibold">
                          {s.followerCount >= 1000
                            ? `${(s.followerCount / 1000).toFixed(1)}K`
                            : s.followerCount}
                        </span>
                      )}
                      <ExternalLink className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center animate-fade-in-up delay-300">
          <Card className="border-coral/20 bg-gradient-to-r from-coral-light to-white">
            <CardContent className="py-10">
              <Mail className="mx-auto size-8 text-coral" />
              <h3 className="mt-4 text-xl font-bold">
                Want to work with {profile.displayName.split(" ")[0]}?
              </h3>
              <p className="mt-2 text-muted-foreground">
                Sign up on CollabHub to send a direct offer or post a campaign.
              </p>
              <Link href="/sign-up" className="mt-6 inline-block">
                <Button className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/25 hover:-translate-y-0.5">
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <Link href="/" className="font-medium text-gradient-primary">
              CollabHub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
