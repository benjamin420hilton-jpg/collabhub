import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { User, InfluencerProfile } from "@/types";

interface InfluencerDashboardProps {
  user: User;
  profile: InfluencerProfile;
  stats: { activeContracts: number; pendingProposals: number };
}

export function InfluencerDashboard({
  user,
  profile,
  stats,
}: InfluencerDashboardProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.displayName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user.firstName ? `Hi ${user.firstName}! ` : ""}
          Here&apos;s your creator overview.
        </p>
      </div>

      {!profile.stripeConnectOnboarded && (
        <Card className="overflow-hidden border-amber-300/50 bg-gradient-to-r from-amber-50 to-white animate-fade-in-up delay-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-500" />
              <CardTitle className="text-lg">
                Complete Payment Setup
              </CardTitle>
            </div>
            <CardDescription>
              Connect your Stripe account so you can receive payouts from brand
              deals.
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover animate-fade-in-up delay-100">
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

        <Card className="card-hover animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Proposals
            </CardTitle>
            <div className="rounded-lg bg-violet-light p-2">
              <Megaphone className="size-4 text-violet" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingProposals}</div>
            <p className="text-xs text-muted-foreground">
              awaiting response
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up delay-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Status
            </CardTitle>
            <Badge
              className={
                profile.isPublic
                  ? "bg-gradient-violet border-0 text-white"
                  : "border-violet/20 bg-violet-light text-violet-dark"
              }
            >
              {profile.isPublic ? "Public" : "Hidden"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {profile.totalFollowers?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">total followers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover animate-fade-in-up delay-300">
        <CardHeader>
          <CardTitle>Find Campaigns</CardTitle>
          <CardDescription>
            Browse available brand campaigns and submit proposals to get paid
            for your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/campaigns">
            <Button className="w-full bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5">
              <Megaphone className="mr-2 size-4" /> Browse Campaigns
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
