import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, FileText, Search, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { User, BrandProfile } from "@/types";

interface BrandDashboardProps {
  user: User;
  profile: BrandProfile;
  stats: { activeCampaigns: number; activeContracts: number };
}

export function BrandDashboard({ user, profile, stats }: BrandDashboardProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.companyName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user.firstName ? `Hi ${user.firstName}! ` : ""}
          Here&apos;s your brand overview.
        </p>
      </div>

      {profile.subscriptionTier === "free" && (
        <Card className="overflow-hidden border-violet/20 bg-gradient-to-r from-violet-light to-white animate-fade-in-up delay-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-violet" />
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
            </div>
            <CardDescription>
              Unlock the Influencer Directory, send direct offers, drop
              transaction fees to 0%, and enable product gifting campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/billing">
              <Button className="bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5">
                Upgrade Now <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover animate-fade-in-up delay-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <div className="rounded-lg bg-violet-light p-2">
              <Megaphone className="size-4 text-violet" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">campaigns running</p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <div className="rounded-lg bg-violet-light p-2">
              <FileText className="size-4 text-violet" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              contracts in progress
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription
            </CardTitle>
            <Badge
              className={
                profile.subscriptionTier === "pro"
                  ? "bg-gradient-violet border-0 text-white"
                  : "border-violet/20 bg-violet-light text-violet-dark"
              }
            >
              {profile.subscriptionTier === "pro" ? "Pro" : "Free"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {profile.subscriptionTier === "pro" ? "0%" : "10%"}
            </div>
            <p className="text-xs text-muted-foreground">platform fee rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="card-hover animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle>Create a Campaign</CardTitle>
            <CardDescription>
              Post a brief to the job board and receive proposals from
              influencers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/campaigns/new">
              <Button variant="outline" className="w-full border-violet/20 hover:bg-violet-light hover:text-violet-dark transition-all">
                <Megaphone className="mr-2 size-4" /> New Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>

        {profile.subscriptionTier === "pro" && (
          <Card className="card-hover animate-fade-in-up delay-400">
            <CardHeader>
              <CardTitle>Discover Influencers</CardTitle>
              <CardDescription>
                Browse the directory and send direct offers to influencers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/directory">
                <Button variant="outline" className="w-full border-violet/20 hover:bg-violet-light hover:text-violet-dark transition-all">
                  <Search className="mr-2 size-4" /> Open Directory
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
