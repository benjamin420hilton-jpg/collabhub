import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function BrandDashboard({ user, profile, stats }: BrandDashboardProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile.companyName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user.firstName ? `Hi ${user.firstName}! ` : ""}
            Here&apos;s what&apos;s happening with your campaigns.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5">
            <Plus className="mr-2 size-4" /> New Campaign
          </Button>
        </Link>
      </div>

      {/* Upgrade banner */}
      {profile.subscriptionTier === "free" && (
        <Card className="overflow-hidden border-coral/20 bg-gradient-to-r from-coral-light to-white animate-fade-in-up delay-100">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover animate-fade-in-up delay-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-coral-light p-2.5">
                <Megaphone className="size-5 text-coral" />
              </div>
              <span className="text-xs text-muted-foreground">{stats.totalCampaigns} total</span>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.activeCampaigns}</p>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-teal-light p-2.5">
                <Users className="size-5 text-teal" />
              </div>
              <Badge className={stats.pendingProposals > 0 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border/60"}>
                {stats.pendingProposals} new
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.pendingProposals}</p>
              <p className="text-sm text-muted-foreground">Pending Proposals</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-coral-light p-2.5">
                <FileText className="size-5 text-coral" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.activeContracts}</p>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-teal-light p-2.5">
                <CheckCircle className="size-5 text-teal" />
              </div>
              <Badge className="border-coral/20 bg-coral-light text-coral-dark">
                {profile.subscriptionTier === "pro" ? "0%" : "10%"} fee
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stats.completedContracts}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent proposals */}
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-coral" />
              Recent Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProposals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No proposals yet. Publish a campaign to start receiving them.
              </p>
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
                    <div className="flex items-center gap-2">
                      {p.proposedRate && (
                        <span className="text-sm font-medium">
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
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-teal" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/campaigns/new" className="block">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-coral/30 hover:bg-coral-light/30">
                <div className="rounded-lg bg-coral-light p-2">
                  <Megaphone className="size-4 text-coral" />
                </div>
                <div>
                  <p className="text-sm font-medium">Create a Campaign</p>
                  <p className="text-xs text-muted-foreground">
                    Post a brief and find influencers
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
                  <p className="text-sm font-medium">View Contracts</p>
                  <p className="text-xs text-muted-foreground">
                    Manage milestones and payments
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </div>
            </Link>

            {profile.subscriptionTier === "pro" && (
              <Link href="/directory" className="block">
                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-coral/30 hover:bg-coral-light/30">
                  <div className="rounded-lg bg-coral-light p-2">
                    <Search className="size-4 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Browse Directory</p>
                    <p className="text-xs text-muted-foreground">
                      Find and reach out to creators
                    </p>
                  </div>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
