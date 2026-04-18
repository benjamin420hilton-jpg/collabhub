"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { disputeContract } from "@/server/actions/contracts";

interface DisputeActionsProps {
  contractId: string;
  status: string;
  isBrand: boolean;
}

export function DisputeActions({
  contractId,
  status,
  isBrand,
}: DisputeActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Only show for active or escrow-funded contracts
  if (status !== "active" && status !== "escrow_funded") {
    return null;
  }

  // Already submitted successfully
  if (success) {
    return (
      <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <Shield className="size-4 shrink-0" />
          <span className="font-medium">
            Dispute raised successfully. Both parties have been notified.
          </span>
        </div>
      </div>
    );
  }

  function handleDispute() {
    setError(null);

    if (reason.trim().length < 20) {
      setError("Please describe the issue in at least 20 characters.");
      return;
    }

    startTransition(async () => {
      const result = await disputeContract(contractId, reason.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setIsExpanded(false);
        setReason("");
      }
    });
  }

  return (
    <div className="space-y-3">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          Having Issues?
        </button>
      ) : (
        <Card className="border-amber-300/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-5 text-amber-600" />
              Raise a Dispute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Before you proceed:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700">
                <li>Disputes should only be raised for genuine issues.</li>
                <li>
                  Both {isBrand ? "you and the influencer" : "you and the brand"}{" "}
                  will be notified.
                </li>
                <li>
                  The contract will be paused while the dispute is reviewed.
                </li>
                <li>
                  Our team will review the case and mediate a resolution.
                </li>
              </ul>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-300/50 bg-red-50 px-4 py-2 text-sm text-red-700">
                <AlertTriangle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dispute-reason" className="text-sm font-medium">
                Describe the issue
              </Label>
              <Textarea
                id="dispute-reason"
                placeholder="Explain what went wrong and what resolution you are seeking..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              This will pause the contract and notify both parties.
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={handleDispute}
                disabled={isPending}
              >
                <AlertTriangle className="mr-2 size-4" />
                {isPending ? "Submitting..." : "Raise Dispute"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsExpanded(false);
                  setReason("");
                  setError(null);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
