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
    <div className="space-y-10 animate-fade-in">
      {/* Welcome header — anchored in a soft gradient card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-white via-teal-light/25 to-coral-light/25 p-8 shadow-sm animate-fade-in-up sm:p-10">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-ocean text-2xl font-bold text-white shadow-lg shadow-coral/20">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {profile.displayName}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {profile.primaryNiche && (
                  <span className="capitalize">
                    {profile.primaryNiche.replace("_", " ")} Creator
                  </span>
                )}
                {profile.city && profile.state && (
                  <span>
                    {" "}· {profile.city}, {profile.state}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link href="/campaigns">
            <Button
              size="lg"
              className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
            >
              <Megaphone className="mr-2 size-4" /> Find Campaigns
            </Button>
          </Link>
        </div>
      </div>

      {/* Free-tier application counter */}
      {!isPro && (
        <Card className="overflow-hidden border-border/50 shadow-sm animate-fade-in-up delay-100">
          <CardContent className="flex items-center gap-4 pt-6 pb-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light">
              <Send className="size-5 text-coral" />
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
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-coral-light">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                  style={{
                    width: `${Math.min((applicationsThisMonth / applicationsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
              {applicationsLeft === 0 && (
                <p className="mt-2 text-xs text-coral">
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
          iconColor="text-teal"
          iconBg="bg-teal-light"
          href="/contracts?status=active"
          trend={[1, 1, 2, 2, 3, 2, stats.activeContracts || 3]}
          className="animate-fade-in-up delay-100"
        />
        <StatCard
          label="Pending Proposals"
          value={stats.pendingProposals}
          icon={Send}
          iconColor="text-coral"
          iconBg="bg-coral-light"
          metadata={`${stats.totalProposals} total`}
          href="/proposals"
          trend={[2, 3, 2, 4, 3, 5, stats.pendingProposals || 3]}
          className="animate-fade-in-up delay-200"
        />
        <StatCard
          label="Accept Rate"
          value={`${acceptRate}%`}
          icon={TrendingUp}
          iconColor="text-teal"
          iconBg="bg-teal-light"
          href="/proposals#accept-rate"
          trend={[30, 45, 40, 55, 50, 65, acceptRate || 60]}
          className="animate-fade-in-up delay-300"
        />
        <StatCard
          label="Total Earnings"
          value={`$${centsToDollars(stats.totalEarnings).toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-coral"
          iconBg="bg-coral-light"
          badge={{
            text: `${stats.completedContracts} done`,
            className: "border-green-200 bg-green-50 text-green-700",
          }}
          href="/earnings"
          trend={[100, 250, 300, 450, 500, 700, stats.totalEarnings / 100 || 800]}
          className="animate-fade-in-up delay-400"
        />
      </div>

      {/* Connected socials + direct-offer settings */}
      <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up delay-300">
        <SocialAccountsCard accounts={socialAccounts} />

        <Card className="border-border/50 shadow-sm card-hover">
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

      {/* Bottom row */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent activity */}
        <Card className="border-border/50 shadow-sm animate-fade-in-up delay-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-coral" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProposals.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-coral-light">
                  <Send className="size-6 text-coral" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No activity yet. Browse campaigns and submit your first proposal.
                </p>
                <Link href="/campaigns" className="mt-4 inline-block">
                  <Button variant="outline" size="sm" className="border-coral/30 hover:bg-coral-light/50">
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
                            className="flex items-center gap-4 rounded-xl border border-border/40 bg-gradient-to-r from-white to-muted/30 p-4 transition-all hover:border-coral/30 hover:shadow-sm"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-light text-sm font-bold text-teal-dark">
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
        <Card className="border-border/50 shadow-sm animate-fade-in-up delay-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-teal" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/campaigns" className="group block">
              <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:bg-coral-light/20 hover:shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light">
                  <Megaphone className="size-5 text-coral" />
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
              <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-light">
                  <FileText className="size-5 text-teal" />
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
              <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:bg-coral-light/20 hover:shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light">
                  <CheckCircle className="size-5 text-coral" />
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
  );
}
