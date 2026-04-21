"use client";

import { useState, useTransition } from "react";
import {
  createInfluencerCheckoutSession,
  createInfluencerPortalSession,
} from "@/server/actions/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Crown,
  Check,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { InfluencerProfile } from "@/types";

interface InfluencerBillingPageProps {
  profile: InfluencerProfile;
  showSuccess: boolean;
  showCanceled: boolean;
}

const FREE_FEATURES = [
  "Browse the campaign board",
  "Up to 5 applications per month",
  "Receive direct offers from Pro brands",
  "Escrow-protected payments",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited campaign applications",
  "PRO badge on your profile and directory card",
  "See new campaigns 24 hours before free creators",
  "Priority placement in the brand directory",
  "Priority support",
];

export function InfluencerBillingPage({
  profile,
  showSuccess,
  showCanceled,
}: InfluencerBillingPageProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPro = profile.subscriptionTier === "pro";

  function handleUpgrade() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createInfluencerCheckoutSession();
      if (result?.error) setErrorMessage(result.error);
    });
  }

  function handleManage() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createInfluencerPortalSession();
      if (result?.error) setErrorMessage(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your Pro Creator subscription.
        </p>
      </div>

      {showSuccess && (
        <Card className="overflow-hidden border-brand/30 bg-gradient-to-br from-brand-light via-white to-brand-light animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg shadow-brand/30">
                <Crown className="size-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">You&apos;re a Pro Creator!</h2>
                <p className="mt-1 text-muted-foreground">
                  Your 7-day free trial has started. Cancel anytime.
                </p>
              </div>
              <div className="mx-auto max-w-sm grid gap-2 text-left">
                <div className="flex items-center gap-3 rounded-lg border border-brand/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-brand shrink-0" />
                  <span className="text-sm font-medium">PRO badge is live on your profile</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-brand/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-brand shrink-0" />
                  <span className="text-sm font-medium">Unlimited applications unlocked</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-brand/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-brand shrink-0" />
                  <span className="text-sm font-medium">24h early access to new campaigns</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCanceled && (
        <Card className="border-amber-300/50 bg-amber-50 animate-fade-in-down">
          <CardContent className="flex items-center gap-3 pt-6">
            <XCircle className="size-5 text-amber-600" />
            <p className="font-medium text-amber-800">
              Checkout canceled. No charges were made.
            </p>
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-red-300/60 bg-red-50 animate-fade-in-down">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="size-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">
                Couldn&apos;t start checkout
              </p>
              <p className="mt-1 text-sm text-red-700 break-words">
                {errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPro && (
        <Card className="border-brand/20 bg-gradient-to-r from-brand-light to-white animate-fade-in-up delay-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-brand" />
                <CardTitle>Pro Creator</CardTitle>
              </div>
              <Badge className="bg-gradient-primary border-0 text-white">
                Active
              </Badge>
            </div>
            <CardDescription>
              $14.99 AUD/month
              {profile.stripeCurrentPeriodEnd && (
                <>
                  {" "}· Renews{" "}
                  {new Date(profile.stripeCurrentPeriodEnd).toLocaleDateString(
                    "en-AU",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </>
              )}
              {profile.cancelAtPeriodEnd && (
                <span className="text-amber-600">
                  {" "}· Cancels at end of period
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManage}
              disabled={isPending}
              className="border-brand/20 hover:bg-brand-light"
            >
              <ExternalLink className="mr-2 size-4" />
              {isPending ? "Loading..." : "Manage Subscription"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up delay-200">
        <Card
          className={
            !isPro
              ? "border-brand/20 ring-2 ring-brand/10"
              : "border-border/60"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              {!isPro && (
                <Badge className="border-brand/20 bg-brand-light text-brand-dark">
                  Current
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground"> / month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card
          className={
            isPro ? "border-brand/20 ring-2 ring-brand/10" : "border-border/60"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="size-5 text-brand" /> Pro Creator
              </span>
              {isPro && (
                <Badge className="bg-gradient-primary border-0 text-white">
                  Current
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$14.99</span>
              <span className="text-muted-foreground"> AUD / month</span>
              {!isPro && (
                <span className="ml-2 text-xs text-brand">7-day free trial</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          {!isPro && (
            <CardFooter>
              <Button
                className="w-full bg-gradient-primary text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5"
                onClick={handleUpgrade}
                disabled={isPending}
              >
                {isPending ? "Loading..." : "Start 7-day Free Trial"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
