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
  requirementsCurrentlyDue?: string[];
  disabledReason?: string | null;
}

const REQUIREMENT_LABELS: Record<string, string> = {
  external_account: "Add a bank account for payouts",
  "individual.verification.document": "Upload a photo ID",
  "individual.verification.additional_document": "Upload an additional ID document",
  "individual.id_number": "Provide your tax ID (or SSN last 4)",
  "individual.dob.day": "Confirm your date of birth",
  "individual.dob.month": "Confirm your date of birth",
  "individual.dob.year": "Confirm your date of birth",
  "individual.first_name": "Provide your legal first name",
  "individual.last_name": "Provide your legal last name",
  "individual.email": "Confirm your email address",
  "individual.phone": "Add your phone number",
  "individual.address.line1": "Provide your home address",
  "individual.address.city": "Provide your home address",
  "individual.address.state": "Provide your home address",
  "individual.address.postal_code": "Provide your home address",
  "tos_acceptance.date": "Accept Stripe's terms of service",
  "tos_acceptance.ip": "Accept Stripe's terms of service",
  "business_profile.url": "Add a website URL (or social media link)",
  "business_profile.mcc": "Select a business category",
  "business_profile.product_description": "Describe what you offer",
};

function humanizeRequirement(code: string): string {
  if (REQUIREMENT_LABELS[code]) return REQUIREMENT_LABELS[code];
  return code.replace(/[_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function dedupeRequirements(codes: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const code of codes) {
    const label = humanizeRequirement(code);
    if (seen.has(label)) continue;
    seen.add(label);
    result.push(label);
  }
  return result;
}

export function ConnectSetup({
  isOnboarded,
  hasAccount,
  requirementsCurrentlyDue = [],
  disabledReason = null,
}: ConnectSetupProps) {
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
    const humanizedRequirements = dedupeRequirements(requirementsCurrentlyDue);
    const isRejected = disabledReason?.startsWith("rejected.");

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

          {isRejected && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Stripe has flagged this account for review and it cannot be used
              for payouts. Please contact support.
            </div>
          )}

          {humanizedRequirements.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-white/60 p-4">
              <p className="text-sm font-medium text-amber-900">
                Stripe still needs:
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-800">
                {humanizedRequirements.map((label) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleContinueSetup}
            disabled={isPending || isRejected}
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
