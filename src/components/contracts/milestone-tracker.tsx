"use client";

import { useTransition, useState } from "react";
import { submitMilestone, reviewMilestone } from "@/server/actions/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  Upload,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { Milestone } from "@/types";

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; label: string; badgeClass: string }
> = {
  pending: {
    icon: Clock,
    color: "text-gray-400",
    label: "Pending",
    badgeClass: "border-gray-200 bg-gray-50 text-gray-600",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-500",
    label: "In Progress",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  submitted: {
    icon: Upload,
    color: "text-amber-500",
    label: "Submitted",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  revision_requested: {
    icon: RotateCcw,
    color: "text-orange-500",
    label: "Revision Requested",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-500",
    label: "Approved",
    badgeClass: "border-green-200 bg-green-50 text-green-700",
  },
  paid: {
    icon: CheckCircle,
    color: "text-green-600",
    label: "Paid",
    badgeClass: "border-green-300 bg-green-50 text-green-700",
  },
  disputed: {
    icon: AlertTriangle,
    color: "text-red-500",
    label: "Disputed",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  },
};

interface MilestoneTrackerProps {
  milestones: Milestone[];
  isBrand: boolean;
  contractId: string;
}

export function MilestoneTracker({
  milestones,
  isBrand,
}: MilestoneTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestones.map((milestone, i) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            index={i}
            isBrand={isBrand}
            isLast={i === milestones.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function MilestoneItem({
  milestone,
  index,
  isBrand,
  isLast,
}: {
  milestone: Milestone;
  index: number;
  isBrand: boolean;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = statusConfig[milestone.status] ?? statusConfig.pending;
  const StatusIcon = config.icon;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitMilestone({
        milestoneId: milestone.id,
        submissionUrl: formData.get("submissionUrl") as string,
        submissionNotes: (formData.get("submissionNotes") as string) || undefined,
      });
      if (result?.error) setError(result.error);
      else setShowSubmitForm(false);
    });
  }

  function handleReview(action: "approve" | "request_revision") {
    setError(null);
    const revisionNotes =
      action === "request_revision"
        ? (document.getElementById(`revision-${milestone.id}`) as HTMLTextAreaElement)?.value
        : undefined;

    startTransition(async () => {
      const result = await reviewMilestone({
        milestoneId: milestone.id,
        action,
        revisionNotes,
      });
      if (result?.error) setError(result.error);
      else setShowRevisionForm(false);
    });
  }

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
      )}

      <div className="flex gap-4">
        {/* Status icon */}
        <div
          className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
            milestone.status === "approved" || milestone.status === "paid"
              ? "border-green-400"
              : milestone.status === "submitted"
                ? "border-amber-400"
                : "border-border"
          }`}
        >
          <StatusIcon className={`size-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{milestone.title}</h4>
              {milestone.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {milestone.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {milestone.amount > 0 && (
                <span className="text-sm font-medium">
                  ${centsToDollars(milestone.amount)}
                </span>
              )}
              <Badge className={config.badgeClass}>{config.label}</Badge>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          {/* Submission info */}
          {milestone.submissionUrl && (
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="size-3.5 text-coral" />
                <a
                  href={milestone.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-coral hover:underline"
                >
                  View Submission
                </a>
              </div>
              {milestone.submissionNotes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {milestone.submissionNotes}
                </p>
              )}
            </div>
          )}

          {/* Revision notes */}
          {milestone.revisionNotes && milestone.status === "revision_requested" && (
            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-orange-800">
                Revision requested:
              </p>
              <p className="mt-0.5 text-sm text-orange-700">
                {milestone.revisionNotes}
              </p>
            </div>
          )}

          {/* Influencer: Submit deliverable */}
          {!isBrand &&
            (milestone.status === "pending" ||
              milestone.status === "in_progress" ||
              milestone.status === "revision_requested") && (
              <div className="mt-3">
                {!showSubmitForm ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-coral/20 hover:bg-coral-light"
                    onClick={() => setShowSubmitForm(true)}
                  >
                    <Upload className="mr-1 size-4" /> Submit Deliverable
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-2">
                      <Label>Deliverable URL *</Label>
                      <Input
                        name="submissionUrl"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        name="submissionNotes"
                        placeholder="Any notes about this submission..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-gradient-primary text-white"
                        disabled={isPending}
                      >
                        {isPending ? "Submitting..." : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSubmitForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

          {/* Brand: Review submission */}
          {isBrand && milestone.status === "submitted" && (
            <div className="mt-3 space-y-3">
              {!showRevisionForm ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-primary text-white"
                    disabled={isPending}
                    onClick={() => handleReview("approve")}
                  >
                    {isPending ? "..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRevisionForm(true)}
                  >
                    Request Revision
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>What needs to be changed?</Label>
                    <Textarea
                      id={`revision-${milestone.id}`}
                      placeholder="Describe what needs to be revised..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      disabled={isPending}
                      onClick={() => handleReview("request_revision")}
                    >
                      {isPending ? "..." : "Send Revision Request"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowRevisionForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
