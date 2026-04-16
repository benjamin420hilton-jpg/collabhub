import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { searchInfluencers, type DirectoryFilters } from "@/server/queries/directory";
import { DirectorySearch } from "@/components/profiles/directory-search";
import { InfluencerCard } from "@/components/profiles/influencer-card";
import { Lock, Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { BrandProfile } from "@/types";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await getUserWithProfile();
  if (!data || !data.profile) redirect("/dashboard");

  // Only brands can access the directory
  if (data.role !== "brand") redirect("/dashboard");

  const profile = data.profile as BrandProfile;
  const isPro = profile.subscriptionTier === "pro";

  // Free brands see a locked gate
  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-violet-light">
            <Lock className="size-10 text-violet" />
          </div>
          <h1 className="text-3xl font-bold">Influencer Directory</h1>
          <p className="mt-3 text-muted-foreground">
            The Discovery Directory is a Pro feature. Upgrade to browse
            influencer profiles, view their metrics, and send direct offers.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/settings/billing">
              <Button className="bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5">
                <Crown className="mr-2 size-4" /> Upgrade to Pro
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Also unlocks 0% transaction fees and product gifting campaigns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const filters: DirectoryFilters = {
    search: params.search || undefined,
    niche: params.niche || undefined,
    state: params.state || undefined,
    minFollowers: params.minFollowers ? Number(params.minFollowers) : undefined,
    platform: params.platform || undefined,
  };

  const results = await searchInfluencers(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Influencer Directory</h1>
        <p className="mt-1 text-muted-foreground">
          Discover creators and send direct offers.
        </p>
      </div>

      <div className="animate-fade-in-up delay-100">
        <DirectorySearch filters={filters} />
      </div>

      {results.length === 0 ? (
        <Card className="animate-fade-in-up delay-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl bg-violet-light p-4">
              <Search className="size-8 text-violet" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No influencers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground animate-fade-in-up delay-200">
            {results.length} influencer{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ profile, socialAccounts }, i) => (
              <div
                key={profile.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(i + 2) * 75}ms` }}
              >
                <InfluencerCard
                  profile={profile}
                  socialAccounts={socialAccounts}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
