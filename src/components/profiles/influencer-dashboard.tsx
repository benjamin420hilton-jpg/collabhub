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
}

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  shortlisted: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  withdrawn: "border-gray-200 bg-gray-50 text-gray-600",
};

export function InfluencerDashboard({
  profile,
  socialAccounts,
  stats,
}: InfluencerDashboardProps) {
  const acceptRate =
    stats.totalProposals > 0
      ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-ocean text-2xl font-bold text-white">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile.displayName}
            </h1>
            <p className="mt-0.5 text-muted-foreground">
              {profile.primaryNiche && (
                <span className="capitalize">{profile.primaryNiche.replace("_", " ")} Creator</span>
              )}
              {profile.city && profile.state && (
                <span> · {profile.city}, {profile.state}</span>
              )}
            </p>
          </div>
        </div>
        <Link href="/campaigns">
          <Button className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5">
            <Megaphone className="mr-2 size-4" /> Find Campaigns
          </Button>
        </Link>
      </div>

      {/* Stripe Connect banner */}
      {!profile.stripeConnectOnboarded && (
        <Card className="overflow-hidden border-amber-300/50 bg-gradient-to-r from-amber-50 to-white animate-fade-in-up delay-100">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Contracts"
          value={stats.activeContracts}
          icon={FileText}
          iconColor="text-teal"
          iconBg="bg-teal-light"
          href="/contracts?status=active"
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
          className="animate-fade-in-up delay-200"
        />
        <StatCard
          label="Accept Rate"
          value={`${acceptRate}%`}
          icon={TrendingUp}
          iconColor="text-teal"
          iconBg="bg-teal-light"
          href="/proposals#accept-rate"
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
          className="animate-fade-in-up delay-400"
        />
      </div>

      {/* Connected socials + direct-offer settings */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fade-in-up delay-300">
        <SocialAccountsCard accounts={socialAccounts} />

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Direct Offers</p>
                <p className="mt-1 text-2xl font-bold">
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card className="animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-coral" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProposals.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet. Browse campaigns and submit your first proposal.
                </p>
                <Link href="/campaigns" className="mt-3 inline-block">
                  <Button variant="outline" size="sm" className="border-coral/20 hover:bg-coral-light">
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentProposals.map((p) => (
                  <div
                    key={p.proposalId}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.campaignTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <Badge className={statusColors[p.proposalStatus] ?? ""}>
                      {p.proposalStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-teal" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/campaigns" className="block">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-coral/30 hover:bg-coral-light/30">
                <div className="rounded-lg bg-coral-light p-2">
                  <Megaphone className="size-4 text-coral" />
                </div>
                <div>
                  <p className="text-sm font-medium">Find Campaigns</p>
                  <p className="text-xs text-muted-foreground">
                    Browse open briefs from brands
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/contracts" className="block">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-teal/30 hover:bg-teal-light/30">
                <div className="rounded-lg bg-teal-light p-2">
                  <FileText className="size-4 text-teal" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your Contracts</p>
                  <p className="text-xs text-muted-foreground">
                    Submit deliverables and track milestones
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/settings" className="block">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-coral/30 hover:bg-coral-light/30">
                <div className="rounded-lg bg-coral-light p-2">
                  <CheckCircle className="size-4 text-coral" />
                </div>
                <div>
                  <p className="text-sm font-medium">Edit Profile & Socials</p>
                  <p className="text-xs text-muted-foreground">
                    Update your bio and link social accounts
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
