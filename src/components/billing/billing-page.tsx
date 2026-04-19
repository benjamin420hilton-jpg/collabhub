"use client";

import { useState, useTransition } from "react";
import {
  createCheckoutSession,
  createPortalSession,
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
import type { BrandProfile, Subscription } from "@/types";

interface BillingPageProps {
  profile: BrandProfile;
  subscription: Subscription | null;
  showSuccess: boolean;
  showCanceled: boolean;
}

const FREE_FEATURES = [
  "Post public campaigns",
  "Receive influencer proposals",
  "Milestone-based contracts",
  "5% Payment Protection Fee on cash deals",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Influencer Discovery Directory",
  "Send direct offers to creators",
  "Product gifting & exchange campaigns",
  "5% Payment Protection Fee on cash deals",
  "Priority support",
];

export function BillingPage({
  profile,
  subscription,
  showSuccess,
  showCanceled,
}: BillingPageProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPro = profile.subscriptionTier === "pro";

  function handleUpgrade() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (result?.error) setErrorMessage(result.error);
    });
  }

  function handleManage() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createPortalSession();
      if (result?.error) setErrorMessage(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Success/Cancel banners */}
      {showSuccess && (
        <Card className="overflow-hidden border-coral/30 bg-gradient-to-br from-coral-light via-white to-coral-light animate-scale-in">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg shadow-coral/30 animate-fade-in-up">
                <Crown className="size-8 text-white" />
              </div>
              <div className="animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold">Welcome to Pro!</h2>
                <p className="mt-1 text-muted-foreground">
                  You&apos;ve unlocked the full power of CollabHub.
                </p>
              </div>
              <div className="mx-auto max-w-sm grid gap-2 text-left animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 rounded-lg border border-coral/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-coral shrink-0" />
                  <span className="text-sm font-medium">Influencer Discovery Directory is now unlocked</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-coral/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-coral shrink-0" />
                  <span className="text-sm font-medium">Influencer Discovery Directory unlocked</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-coral/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-coral shrink-0" />
                  <span className="text-sm font-medium">Direct offers to influencers enabled</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-coral/10 bg-white/80 p-3">
                  <CheckCircle className="size-5 text-coral shrink-0" />
                  <span className="text-sm font-medium">Product gifting campaigns unlocked</span>
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

      {/* Current plan */}
      {isPro && subscription && (
        <Card className="border-coral/20 bg-gradient-to-r from-coral-light to-white animate-fade-in-up delay-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-coral" />
                <CardTitle>Pro Plan</CardTitle>
              </div>
              <Badge className="bg-gradient-primary border-0 text-white">
                Active
              </Badge>
            </div>
            <CardDescription>
              $49 AUD/month
              {subscription.stripeCurrentPeriodEnd && (
                <>
                  {" "}· Renews{" "}
                  {new Date(
                    subscription.stripeCurrentPeriodEnd,
                  ).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </>
              )}
              {subscription.cancelAtPeriodEnd && (
                <span className="text-amber-600">
                  {" "}
                  · Cancels at end of period
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManage}
              disabled={isPending}
              className="border-coral/20 hover:bg-coral-light"
            >
              <ExternalLink className="mr-2 size-4" />
              {isPending ? "Loading..." : "Manage Subscription"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Plan comparison */}
      <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up delay-200">
        {/* Free */}
        <Card
          className={`${!isPro ? "border-coral/20 ring-2 ring-coral/10" : "border-border/60"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              {!isPro && (
                <Badge className="border-coral/20 bg-coral-light text-coral-dark">
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

        {/* Pro */}
        <Card
          className={`${isPro ? "border-coral/20 ring-2 ring-coral/10" : "border-border/60"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="size-5 text-coral" /> Pro
              </span>
              {isPro && (
                <Badge className="bg-gradient-primary border-0 text-white">
                  Current
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$49</span>
              <span className="text-muted-foreground"> AUD / month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-coral" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          {!isPro && (
            <CardFooter>
              <Button
                className="w-full bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
                onClick={handleUpgrade}
                disabled={isPending}
              >
                {isPending ? "Loading..." : "Upgrade to Pro"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
