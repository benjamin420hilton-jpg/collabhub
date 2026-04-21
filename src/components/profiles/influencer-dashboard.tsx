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
import { SocialAccountsCard } from "@/components/profiles/social-accounts-card";
import {
  Megaphone, FileText, AlertCircle, DollarSign,
  TrendingUp, Clock, CheckCircle, Send, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { centsToDollars } from "@/lib/constants";
import type { User, InfluencerProfile, SocialAccount } from "@/types";

interface InfluencerDashboardProps {
  user: User;
  profile: InfluencerProfile;
  socialAccounts: SocialAccount[];
  stats: {
    activeContracts: number;
    pendingProposals: number;
    totalProposals: number;
    acceptedProposals: number;
    completedContracts: number;
    totalEarnings: number;
    recentProposals: {
      proposalId: string;
      campaignTitle: string;
      proposalStatus: string;
      createdAt: Date;
    }[];
  };
  applicationsThisMonth: number;
  applicationsLimit: number;
}

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  shortlisted: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  withdrawn: "border-gray-200 bg-gray-50 text-gray-600",
};

type ProposalRow = InfluencerDashboardProps["stats"]["recentProposals"][number];

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

export function InfluencerDashboard({
  profile,
  socialAccounts,
  stats,
  applicationsThisMonth,
  applicationsLimit,
}: InfluencerDashboardProps) {
  const acceptRate =
    stats.totalProposals > 0
      ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100)
      : 0;
  const isPro = profile.subscriptionTier === "pro";
  const applicationsLeft = Math.max(
    0,
    applicationsLimit - applicationsThisMonth,
  );
  const grouped = bucketByRecency(stats.recentProposals);
  const groups: [string, ProposalRow[]][] = [
    ["Today", grouped.today],
    ["This week", grouped.thisWeek],
    ["Earlier", grouped.earlier],
  ];

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
        className="pointer-events-none absolute -right-20 -top-24 -z-10 size-96 rounded-full bg-gradient-ocean opacity-[0.08] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 -z-10 size-80 rounded-full bg-gradient-primary opacity-[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl space-y-12 animate-fade-in">
        {/* Welcome header — glossy, with floating blobs + stat chips */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-highlight-light/60 via-white to-brand-light/50 p-8 shadow-sm animate-fade-in-up sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gradient-ocean opacity-20 blur-3xl animate-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 size-40 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float"
            style={{ animationDelay: "400ms" }}
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-ocean text-2xl font-bold text-white shadow-lg shadow-brand/25">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-highlight/20 bg-white/70 px-3 py-1 text-xs font-medium text-highlight-dark backdrop-blur-sm">
                  {profile.primaryNiche ? (
                    <span className="capitalize">
                      {profile.primaryNiche.replace("_", " ")} Creator
                    </span>
                  ) : (
                    "Creator workspace"
                  )}
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, {profile.displayName}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {profile.city && profile.state
                    ? `${profile.city}, ${profile.state}`
                    : "Manage your collabs and track your earnings."}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="flex flex-wrap gap-2">
                <div className="glass rounded-2xl px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contracts
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    {stats.activeContracts}
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
                    Earned
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    ${centsToDollars(stats.totalEarnings).toLocaleString()}
                  </p>
                </div>
              </div>
              <Link href="/campaigns">
                <Button className="bg-gradient-primary text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5">
                  <Megaphone className="mr-2 size-4" /> Find Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Free-tier application counter */}
        {!isPro && (
          <Card className="overflow-hidden border-border/50 bg-white/80 shadow-sm backdrop-blur-sm animate-fade-in-up delay-100">
            <CardContent className="flex items-center gap-4 pt-6 pb-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                <Send className="size-5 text-brand" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {applicationsLeft} of {applicationsLimit} applications left this month
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Resets on the 1st
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-light">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                    style={{
                      width: `${Math.min((applicationsThisMonth / applicationsLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                {applicationsLeft === 0 && (
                  <p className="mt-2 text-xs text-brand">
                    You&apos;re out of free applications — upgrade to Pro for unlimited.
                  </p>
                )}
              </div>
              <Link href="/settings/billing">
                <Button size="sm" className="bg-gradient-primary text-white shadow-sm">
                  Upgrade
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stripe Connect banner */}
        {!profile.stripeConnectOnboarded && (
          <Card className="overflow-hidden border-amber-300/50 bg-gradient-to-r from-amber-50 to-white shadow-sm animate-fade-in-up delay-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-500" />
                <CardTitle className="text-lg">Complete Payment Setup</CardTitle>
              </div>
              <CardDescription>
                Connect your Stripe account to receive payouts when brands approve your milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button variant="outline" className="border-amber-300 hover:bg-amber-50 transition-all">
                  Set Up Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StatCard
            label="Active Contracts"
            value={stats.activeContracts}
            icon={FileText}
            iconColor="text-highlight"
            iconBg="bg-highlight-light"
            href="/contracts?status=active"
            className="animate-fade-in-up delay-100"
          />
          <StatCard
            label="Pending Proposals"
            value={stats.pendingProposals}
            icon={Send}
            iconColor="text-brand"
            iconBg="bg-brand-light"
            metadata={`${stats.totalProposals} total`}
            href="/proposals"
            className="animate-fade-in-up delay-200"
          />
          <StatCard
            label="Accept Rate"
            value={`${acceptRate}%`}
            icon={TrendingUp}
            iconColor="text-highlight"
            iconBg="bg-highlight-light"
            href="/proposals#accept-rate"
            className="animate-fade-in-up delay-300"
          />
          <StatCard
            label="Total Earnings"
            value={`$${centsToDollars(stats.totalEarnings).toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-brand"
            iconBg="bg-brand-light"
            badge={{
              text: `${stats.completedContracts} done`,
              className: "border-green-200 bg-green-50 text-green-700",
            }}
            href="/earnings"
            className="animate-fade-in-up delay-400"
          />
        </div>

        {/* Connected socials + direct-offer settings */}
        <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up delay-300">
          <SocialAccountsCard accounts={socialAccounts} />

          <Card className="border-border/50 bg-white/80 shadow-sm backdrop-blur-sm card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Direct Offers</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {profile.acceptsDirectOffers ? "Enabled" : "Disabled"}
                  </p>
                </div>
                {profile.minimumRate && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Min Rate</p>
                    <p className="text-lg font-bold">
                      ${(profile.minimumRate / 100).toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {profile.acceptsDirectOffers
                  ? "Brands can send you direct campaign offers from the directory."
                  : "Turn on direct offers in settings to get found by brands."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row — Recent Activity gets more room than Quick Actions */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Recent activity */}
          <Card className="border-border/50 bg-white/80 shadow-sm backdrop-blur-sm animate-fade-in-up delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-brand" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentProposals.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-light">
                    <Send className="size-6 text-brand" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Browse campaigns and submit your first proposal.
                  </p>
                  <Link href="/campaigns" className="mt-4 inline-block">
                    <Button variant="outline" size="sm" className="border-brand/30 hover:bg-brand-light/50">
                      Browse Campaigns
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
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-highlight-light text-sm font-bold text-highlight-dark">
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
                              <Badge className={statusColors[p.proposalStatus] ?? ""}>
                                {p.proposalStatus}
                              </Badge>
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
          <Card className="border-border/50 bg-white/80 shadow-sm backdrop-blur-sm animate-fade-in-up delay-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-highlight" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/campaigns" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-light/20 hover:shadow-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                    <Megaphone className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Find Campaigns</p>
                    <p className="text-xs text-muted-foreground">
                      Browse open briefs from brands
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
                    <p className="text-sm font-semibold">Your Contracts</p>
                    <p className="text-xs text-muted-foreground">
                      Submit deliverables and track milestones
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>

              <Link href="/settings" className="group block">
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-light/20 hover:shadow-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                    <CheckCircle className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Edit Profile & Socials</p>
                    <p className="text-xs text-muted-foreground">
                      Update your bio and link social accounts
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
