"use client";

import { useTransition, useState } from "react";
import { submitProposal } from "@/server/actions/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ApplyCampaignFormProps {
  campaignId: string;
  brandName: string;
  hasApplied: boolean;
}

export function ApplyCampaignForm({
  campaignId,
  brandName,
  hasApplied,
}: ApplyCampaignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(hasApplied);

  if (submitted) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle className="size-5 text-green-500" />
          <div>
            <p className="font-semibold">Proposal Submitted</p>
            <p className="text-sm text-muted-foreground">
              {brandName} will review your proposal and get back to you.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitProposal({
        campaignId,
        coverLetter: formData.get("coverLetter") as string,
        proposedRate: Number(formData.get("proposedRate")),
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSubmitted(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Apply to This Campaign</CardTitle>
          <CardDescription>
            Tell {brandName} why you&apos;re a great fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Your Pitch *</Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              placeholder="Introduce yourself, share relevant experience, and explain why you'd be perfect for this campaign..."
              rows={5}
              required
              minLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedRate">Your Rate ($AUD) *</Label>
            <Input
              id="proposedRate"
              name="proposedRate"
              type="number"
              min="0"
              placeholder="500"
              required
            />
            <p className="text-xs text-muted-foreground">
              How much you want to be paid for this campaign.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Proposal"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
