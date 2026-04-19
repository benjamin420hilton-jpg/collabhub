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

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome header — anchored in a soft gradient card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-white via-coral-light/30 to-teal-light/20 p-8 shadow-sm animate-fade-in-up sm:p-10">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-white/70 px-3 py-1 text-xs font-medium text-coral-dark backdrop-blur-sm">
              <Sparkles className="size-3" />
              Brand workspace
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {profile.companyName}
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {user.firstName ? `Hi ${user.firstName}. ` : ""}
              Here&apos;s what&apos;s happening with your campaigns today.
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button
              size="lg"
              className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
            >
              <Plus className="mr-2 size-4" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Upgrade banner */}
      {profile.subscriptionTier === "free" && (
        <Card className="overflow-hidden border-coral/20 bg-gradient-to-r from-coral-light to-white shadow-sm animate-fade-in-up delay-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-coral" />
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
            </div>
            <CardDescription>
              Unlock the Influencer Directory, 0% fees, direct offers, and product gifting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/billing">
              <Button className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5">
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
          iconColor="text-coral"
          iconBg="bg-coral-light"
          metadata={`${stats.totalCampaigns} total`}
          href="/campaigns?status=active"
          trend={[2, 3, 2, 4, 3, 5, stats.activeCampaigns || 4]}
          className="animate-fade-in-up delay-100"
        />
        <StatCard
          label="Pending Proposals"
          value={stats.pendingProposals}
          icon={Users}
          iconColor="text-teal"
          iconBg="bg-teal-light"
          badge={{
            text: `${stats.pendingProposals} new`,
            className:
              stats.pendingProposals > 0
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-border/60",
          }}
          href="/proposals"
          trend={[1, 2, 4, 3, 5, 4, stats.pendingProposals || 3]}
          className="animate-fade-in-up delay-200"
        />
        <StatCard
          label="Active Contracts"
          value={stats.activeContracts}
          icon={FileText}
          iconColor="text-coral"
          iconBg="bg-coral-light"
          href="/contracts?status=active"
          trend={[1, 1, 2, 3, 2, 4, stats.activeContracts || 3]}
          className="animate-fade-in-up delay-300"
        />
        <StatCard
          label="Completed"
          value={stats.completedContracts}
          icon={CheckCircle}
          iconColor="text-teal"
          iconBg="bg-teal-light"
          badge={{
            text: `${profile.subscriptionTier === "pro" ? "0%" : "10%"} fee`,
            className: "border-coral/20 bg-coral-light text-coral-dark",
          }}
          href="/contracts?status=completed"
          trend={[0, 1, 1, 2, 3, 4, stats.completedContracts || 5]}
          className="animate-fade-in-up delay-400"
        />
      </div>

      {/* Bottom row */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent proposals */}
        <Card className="border-border/50 shadow-sm animate-fade-in-up delay-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-coral" />
              Recent Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProposals.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-coral-light">
                  <Users className="size-6 text-coral" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No proposals yet. Publish a campaign to start receiving them.
                </p>
                <Link href="/campaigns/new" className="mt-4 inline-block">
                  <Button variant="outline" size="sm" className="border-coral/30 hover:bg-coral-light/50">
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
                            className="flex items-center gap-4 rounded-xl border border-border/40 bg-gradient-to-r from-white to-muted/30 p-4 transition-all hover:border-coral/30 hover:shadow-sm"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light text-sm font-bold text-coral-dark">
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
        <Card className="border-border/50 shadow-sm animate-fade-in-up delay-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-teal" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/campaigns/new" className="group block">
              <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:bg-coral-light/20 hover:shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light">
                  <Megaphone className="size-5 text-coral" />
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
              <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-teal/30 hover:bg-teal-light/20 hover:shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-light">
                  <FileText className="size-5 text-teal" />
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
                <div className="flex items-center gap-4 rounded-xl border border-border/40 p-4 transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:bg-coral-light/20 hover:shadow-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral-light">
                    <Search className="size-5 text-coral" />
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
  );
}
