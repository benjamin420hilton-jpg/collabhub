"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CreditCard, AlertTriangle } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import { createEscrowCheckout } from "@/server/actions/payments";

interface EscrowFunderProps {
  contractId: string;
  totalAmount: number;
  influencerOnboarded: boolean;
}

export function EscrowFunder({
  contractId,
  totalAmount,
  influencerOnboarded,
}: EscrowFunderProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const amountDollars = centsToDollars(totalAmount);

  function handleFundEscrow() {
    setError(null);
    startTransition(async () => {
      // createEscrowCheckout redirects to Stripe Checkout on success.
      // It only returns if there's an error.
      const result = await createEscrowCheckout(contractId);
      if (result && "error" in result) {
        setError(result.error as string);
      }
    });
  }

  if (!influencerOnboarded) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 animate-fade-in-up delay-100">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">Waiting on Influencer</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The influencer hasn&apos;t set up their payment account yet.
                Once they complete their Stripe onboarding, you&apos;ll be able
                to fund the escrow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coral/20 bg-gradient-to-br from-coral-light via-white to-teal-light animate-fade-in-up delay-100">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-md shadow-coral/20">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Fund Escrow</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Securely fund the escrow to begin the collaboration. Funds are
              held safely and only released when you approve completed
              milestones.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-coral/10 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold">
              ${amountDollars.toFixed(2)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                AUD
              </span>
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleFundEscrow}
          disabled={isPending}
          className="w-full bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
        >
          <CreditCard className="mr-2 size-4" />
          {isPending
            ? "Redirecting to checkout..."
            : `Fund Escrow \u2014 $${amountDollars.toFixed(2)} AUD`}
        </Button>
      </CardContent>
    </Card>
  );
}
