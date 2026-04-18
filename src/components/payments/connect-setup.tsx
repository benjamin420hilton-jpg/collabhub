"use client";

import { useTransition, useState } from "react";
import {
  createConnectAccount,
  createConnectOnboardingLink,
  createConnectDashboardLink,
} from "@/server/actions/connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ExternalLink,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface ConnectSetupProps {
  isOnboarded: boolean;
  hasAccount: boolean;
}

export function ConnectSetup({ isOnboarded, hasAccount }: ConnectSetupProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreateAccount() {
    setError(null);
    startTransition(async () => {
      const result = await createConnectAccount();
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleContinueSetup() {
    setError(null);
    startTransition(async () => {
      const result = await createConnectOnboardingLink();
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleViewDashboard() {
    setError(null);
    startTransition(async () => {
      const result = await createConnectDashboardLink();
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  }

  // Fully onboarded
  if (hasAccount && isOnboarded) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 via-white to-green-50 animate-fade-in-up delay-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <CardTitle>Payments Active</CardTitle>
            </div>
            <Badge className="border-green-300 bg-green-50 text-green-700">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You&apos;re all set to receive payments. Funds from approved
            milestones will be deposited directly to your connected account.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            variant="outline"
            onClick={handleViewDashboard}
            disabled={isPending}
            className="border-green-200 hover:bg-green-50"
          >
            <ExternalLink className="mr-2 size-4" />
            {isPending ? "Loading..." : "View Stripe Dashboard"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Has account but not finished onboarding
  if (hasAccount && !isOnboarded) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 animate-fade-in-up delay-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
            <CardTitle>Complete Payment Setup</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Stripe account has been created but onboarding is not yet
            complete. Please finish setting up your account to start receiving
            payments.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleContinueSetup}
            disabled={isPending}
            className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
          >
            <ExternalLink className="mr-2 size-4" />
            {isPending ? "Loading..." : "Continue Setup"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No account yet
  return (
    <Card className="border-coral/20 bg-gradient-to-br from-coral-light via-white to-teal-light animate-fade-in-up delay-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md shadow-coral/20">
            <CreditCard className="size-5 text-white" />
          </div>
          <CardTitle>Set Up Payments</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to get paid for your collaborations.
          Stripe handles all payments securely -- you&apos;ll receive funds
          directly to your bank account when milestones are approved.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          onClick={handleCreateAccount}
          disabled={isPending}
          className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
        >
          <CreditCard className="mr-2 size-4" />
          {isPending ? "Loading..." : "Connect with Stripe"}
        </Button>
      </CardContent>
    </Card>
  );
}
