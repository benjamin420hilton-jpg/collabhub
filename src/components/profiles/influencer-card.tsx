import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Send, ExternalLink } from "lucide-react";
import type { InfluencerProfile, SocialAccount } from "@/types";

const platformConfig: Record<string, { label: string; color: string; bg: string }> = {
  instagram: { label: "IG", color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  tiktok: { label: "TT", color: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
  youtube: { label: "YT", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  twitter: { label: "X", color: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
  linkedin: { label: "LI", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  facebook: { label: "FB", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  pinterest: { label: "PI", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  snapchat: { label: "SC", color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
  threads: { label: "TH", color: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
};

interface InfluencerCardProps {
  profile: InfluencerProfile;
  socialAccounts: SocialAccount[];
}

export function InfluencerCard({
  profile,
  socialAccounts,
}: InfluencerCardProps) {
  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-violet text-lg font-bold text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold">{profile.displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {profile.city && profile.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {profile.city}, {profile.state}
                  </span>
                )}
              </div>
            </div>
          </div>
          {profile.acceptsDirectOffers && (
            <Link href={`/directory/${profile.id}`}>
              <Button
                size="sm"
                className="bg-gradient-violet text-white shadow-sm shadow-violet/20 transition-all hover:shadow-md hover:shadow-violet/30 hover:-translate-y-0.5"
              >
                <Send className="mr-1 size-3.5" /> Offer
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {profile.primaryNiche && (
            <Badge className="border-violet/20 bg-violet-light text-violet-dark">
              {profile.primaryNiche.replace("_", " ")}
            </Badge>
          )}
          {profile.totalFollowers && profile.totalFollowers > 0 && (
            <Badge variant="outline" className="border-border/60">
              <Users className="mr-1 size-3" />
              {profile.totalFollowers >= 1000
                ? `${(profile.totalFollowers / 1000).toFixed(1)}K`
                : profile.totalFollowers}
            </Badge>
          )}
        </div>

        {/* Social links */}
        {socialAccounts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {socialAccounts.map((s) => {
              const config = platformConfig[s.platform] ?? {
                label: s.platform,
                color: "text-gray-600",
                bg: "bg-gray-50 border-gray-200",
              };
              return (
                <a
                  key={s.id}
                  href={s.profileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105 hover:shadow-sm ${config.bg} ${config.color}`}
                >
                  {config.label}
                  {s.followerCount && s.followerCount > 0 && (
                    <span className="font-bold">
                      {s.followerCount >= 1000
                        ? `${(s.followerCount / 1000).toFixed(1)}K`
                        : s.followerCount}
                    </span>
                  )}
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
