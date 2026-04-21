import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Megaphone, FileText, Search, ArrowRight, Sparkles,
  Users, TrendingUp, Clock, CheckCircle, Plus,
} from "lucide-react";
import Link from "next/link";
import { centsToDollars } from "@/lib/constants";
import type { User, BrandProfile } from "@/types";

interface BrandDashboardProps {
  user: User;
  profile: BrandProfile;
  stats: {
    activeCampaigns: number;
    activeContracts: number;
    totalCampaigns: number;
    pendingProposals: number;
    completedContracts: number;
    recentProposals: {
      proposalId: string;
      campaignTitle: string;
      proposalStatus: string;
      proposedRate: number | null;
      createdAt: Date;
    }[];
  };
}

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  shortlisted: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

type ProposalRow = BrandDashboardProps["stats"]["recentProposals"][number];

function bucketByRecency(rows: ProposalRow[]) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const today: ProposalRow[] = [];
  const thisWeek: ProposalRow[] = [];
  const earlier: ProposalRow[] = [];
  for (const row of rows) {
    const age = now - new Date(row.createdAt).getTime();
    if (age < dayMs) today.push(row);
    else if (age < 7 * dayMs) thisWeek.push(row);
    else earlier.push(row);
  }
  return { today, thisWeek, earlier };
}

export function BrandDashboard({ user, profile, stats }: BrandDashboardProps) {
  const grouped = bucketByRecency(stats.recentProposals);
  const groups: [string, ProposalRow[]][] = [
    ["Today", grouped.today],
    ["This week", grouped.thisWeek],
    ["Earlier", grouped.earlier],
  ];
  const monogram = profile.companyName.charAt(0).toUpperCase();

  return (
    <div className="relative -mx-6 -my-8 min-h-[calc(100vh-5rem)] overflow-hidden px-6 py-8">
      {/* Soft mesh gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero"
      />
      {/* Floating blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 -z-10 size-96 rounded-full bg-gradient-primary opacity-[0.08] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 -z-10 size-80 rounded-full bg-gradient-ocean opacity-[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl space-y-12 animate-fade-in">
        {/* Welcome header — glossy, with floating blobs + stat chips */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-brand-light via-white to-highlight-light/50 p-8 shadow-sm animate-fade-in-up sm:p-10">
          {/* Decorative floating blobs inside the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 size-40 rounded-full bg-gradient-ocean opacity-20 blur-3xl animate-float"
            style={{ animationDelay: "400ms" }}
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-2xl font-bold text-white shadow-lg shadow-brand/25">
                {monogram}
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/70 px-3 py-1 text-xs font-medium text-brand-dark backdrop-blur-sm">
                  <Sparkles className="size-3" />
                  Brand workspace
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, {profile.companyName}
                </h1>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  {user.firstName ? `Hi ${user.firstName}. ` : ""}
                  Here&apos;s what&apos;s happening with your campaigns today.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="flex flex-wrap gap-2">
                <div className="glass rounded-2xl px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    {stats.activeCampaigns}
                  </p>
                </div>
                <div className="glass rounded-2xl px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    {stats.pendingProposals}
                  </p>
                </div>
                <div className="glass rounded-2xl px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contracts
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    {stats.activeContracts}
                  </p>
                </div>
              </div>
              <Link href="/campaigns/new">
                <Button className="bg-gradient-primary text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5">
                  <Plus className="mr-2 size-4" /> New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Upgrade banner */}
        {profile.subscriptionTier === "free" && (
          <Card className="overflow-hidden border-brand/20 bg-gradient-to-r from-brand-light to-white shadow-sm animate-fade-in-up delay-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-brand" />
                <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
              </div>
              <CardDescription>
                Unlock the Influencer Directory, 0% fees, direct offers, and product gifting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/billing">
                <Button className="bg-gradient-primary text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5">
                  Upgrade Now <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StatCard
            label="Active Campaigns"
            value={stats.activeCampaigns}
            icon={Megaphone}
            iconColor="text-brand"
            iconBg="bg-brand-light"
            metadata={`${stats.totalCampaigns} total`}
            href="/campaigns?status=active"
            className="animate-fade-in-up delay-100"
          />
          <StatCard
            label="Pending Proposals"
            value={stats.pendingProposals}
            icon={Users}
            iconColor="text-highlight"
            iconBg="bg-highlight-light"
            badge={{
              text: `${stats.pendingProposals} new`,
              className:
                stats.pendingProposals > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-border/60",
            }}
            href="/proposals"
            className="animate-fade-in-up delay-200"
          />
          <StatCard
            label="Active Contracts"
            value={stats.activeContracts}
            icon={FileText}
            iconColor="text-brand"
            iconBg="bg-brand-light"
            href="/contracts?status=active"
            className="animate-fade-in-up delay-300"
          />
          <StatCard
            label="Completed"
            value={stats.completedContracts}
            icon={CheckCircle}
            iconColor="text-highlight"
            iconBg="bg-highlight-light"
            badge={{
              text: `${profile.subscriptionTier === "pro" ? "0%" : "10%"} fee`,
              className: "border-brand/20 bg-brand-light text-brand-dark",
            }}
            href="/contracts?status=completed"
            className="animate-fade-in-up delay-400"
          />
        </div>

        {/* Bottom row — Recent Proposals gets more room than Quick Actions */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Recent proposals */}
          <Card className="border-border/50 bg-white/80 shadow-sm backdrop-blur-sm animate-fade-in-up delay-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-brand" />
                Recent Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentProposals.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-light">
                    <Users className="size-6 text-brand" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No proposals yet. Publish a campaign to start receiving them.
                  </p>
                  <Link href="/campaigns/new" className="mt-4 inline-block">
                    <Button variant="outline" size="sm" className="border-brand/30 hover:bg-brand-light/50">
                      Create a Campaign
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {groups.map(([label, rows]) =>
                    rows.length === 0 ? null : (
                      <div key={label}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <div className="space-y-2">
                          {rows.map((p) => (
                            <div
                              key={p.proposalId}
                              className="flex items-center gap-4 rounded-xl border border-border/40 bg-gradient-to-r from-white to-muted/30 p-4 transition-all hover:border-brand/30 hover:shadow-sm"
                            >
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-sm font-bold text-brand-dark">
                                {p.campaignTitle.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {p.campaignTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(p.createdAt).toLocaleDateString(
                                    "en-AU",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    },
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {p.proposedRate && (
                                  <span className="text-sm font-semibold tracking-tight">
                                    ${centsToDollars(p.proposedRate)}
                                  </span>
                                )}
                                <Badge className={statusColors[p.proposalStatus] ?? ""}>
                                  {p.proposalStatus}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border/50 bg-white/80 shadow-sm backdrop-blur-sm animate-fade-in-up delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-highlight" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/campaigns/new" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-light/20 hover:shadow-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                    <Megaphone className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Create a Campaign</p>
                    <p className="text-xs text-muted-foreground">
                      Post a brief and find influencers
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>

              <Link href="/contracts" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-highlight/30 hover:bg-highlight-light/20 hover:shadow-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-highlight-light">
                    <FileText className="size-5 text-highlight" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">View Contracts</p>
                    <p className="text-xs text-muted-foreground">
                      Manage milestones and payments
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>

              {profile.subscriptionTier === "pro" && (
                <Link href="/directory" className="group block">
                  <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-light/20 hover:shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                      <Search className="size-5 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Browse Directory</p>
                      <p className="text-xs text-muted-foreground">
                        Find and reach out to creators
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
