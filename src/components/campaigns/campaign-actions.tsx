"use client";

import { useTransition, useState } from "react";
import {
  pauseCampaign,
  resumeCampaign,
  flagCampaign,
} from "@/server/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pause, Play, Flag, AlertTriangle } from "lucide-react";

interface CampaignActionsProps {
  campaignId: string;
  status: string;
  isBrandOwner: boolean;
}

export function CampaignActions({
  campaignId,
  status,
  isBrandOwner,
}: CampaignActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handlePause() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await pauseCampaign(campaignId);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Campaign paused successfully.");
      }
    });
  }

  function handleResume() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await resumeCampaign(campaignId);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Campaign resumed successfully.");
      }
    });
  }

  function handleFlag() {
    setError(null);
    setSuccess(null);

    if (reason.trim().length < 10) {
      setError("Please provide a reason with at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await flagCampaign(campaignId, reason.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Report submitted. Thank you for helping keep CollabHub safe.");
        setShowReportForm(false);
        setReason("");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300/50 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-300/50 bg-green-50 px-4 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {isBrandOwner ? (
        <div className="flex gap-3">
          {status === "published" && (
            <Button
              variant="destructive"
              onClick={handlePause}
              disabled={isPending}
            >
              <Pause className="mr-2 size-4" />
              {isPending ? "Pausing..." : "Pause Campaign"}
            </Button>
          )}

          {status === "paused" && (
            <Button
              className="bg-gradient-primary text-white shadow-sm hover:opacity-90"
              onClick={handleResume}
              disabled={isPending}
            >
              <Play className="mr-2 size-4" />
              {isPending ? "Resuming..." : "Resume Campaign"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!showReportForm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportForm(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="mr-2 size-4" />
              Report Campaign
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-border/60 p-4">
              <Label htmlFor="flag-reason" className="text-sm font-medium">
                Why are you reporting this campaign?
              </Label>
              <Textarea
                id="flag-reason"
                placeholder="Describe the issue (e.g. misleading content, scam, inappropriate material)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleFlag}
                  disabled={isPending}
                >
                  <AlertTriangle className="mr-2 size-4" />
                  {isPending ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReportForm(false);
                    setReason("");
                    setError(null);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
