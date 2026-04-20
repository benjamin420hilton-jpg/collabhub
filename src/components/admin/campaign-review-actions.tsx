"use client";

import { useState, useTransition } from "react";
import { approveCampaign, rejectCampaign } from "@/server/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  campaignId: string;
}

export function CampaignReviewActions({ campaignId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveCampaign(campaignId);
      if (result?.error) setError(result.error);
    });
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await rejectCampaign(campaignId, reason);
      if (result?.error) setError(result.error);
      else {
        setShowReject(false);
        setReason("");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!showReject ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="gap-2 bg-green-600 text-white hover:bg-green-700"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Approve & publish
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
          >
            <X className="size-4" />
            Reject
          </Button>
        </div>
      ) : (
        <form onSubmit={handleReject} className="space-y-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this campaign being rejected? The brand will see this message."
            rows={3}
            className="text-sm"
            required
            minLength={10}
            maxLength={500}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={isPending || reason.trim().length < 10}
              className="gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
              Confirm rejection
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowReject(false);
                setReason("");
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
