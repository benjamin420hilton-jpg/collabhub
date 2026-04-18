import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import type { SocialAccount } from "@/types";

interface SocialAccountsCardProps {
  accounts: SocialAccount[];
}

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  threads: "Threads",
};

function syncedLabel(syncedAt: Date | null): {
  text: string;
  stale: boolean;
} {
  if (!syncedAt) return { text: "Never synced", stale: true };
  const days = Math.floor(
    (Date.now() - new Date(syncedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return { text: "Synced today", stale: false };
  if (days === 1) return { text: "Synced 1d ago", stale: false };
  if (days < 30) return { text: `Synced ${days}d ago`, stale: days > 14 };
  const months = Math.floor(days / 30);
  return {
    text: months === 1 ? "Synced 1mo ago" : `Synced ${months}mo ago`,
    stale: true,
  };
}

export function SocialAccountsCard({ accounts }: SocialAccountsCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="size-5 text-teal" />
          Connected Socials
        </CardTitle>
        <CardDescription>
          Follower counts shown are from our last sync — brands see the same
          freshness label.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No platforms connected yet.
            </p>
            <Link href="/settings" className="mt-3">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 size-4" /> Connect a Platform
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {accounts.map((a) => {
              const synced = syncedLabel(a.metricsLastSyncedAt);
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {platformLabels[a.platform] ?? a.platform}
                      <span className="ml-2 text-muted-foreground">
                        @{a.handle}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.followerCount !== null
                        ? `${a.followerCount.toLocaleString()} followers`
                        : "Follower count unknown"}
                    </p>
                  </div>
                  <Badge
                    className={
                      synced.stale
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-teal/20 bg-teal-light text-teal-dark"
                    }
                  >
                    {synced.text}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
