"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProposalStatus } from "@/server/actions/proposals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { Proposal } from "@/types";

interface ProposalItemProps {
  proposal: Proposal;
  influencerName: string;
  influencerNiche: string | null;
  influencerFollowers: number | null;
  influencerCity: string | null;
  influencerState: string | null;
}

function ProposalItem({
  proposal,
  influencerName,
  influencerNiche,
  influencerFollowers,
  influencerCity,
  influencerState,
}: ProposalItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(status: "shortlisted" | "accepted" | "rejected") {
    startTransition(async () => {
      await updateProposalStatus(proposal.id, status);
      if (status === "accepted") {
        router.push(`/contracts/new?proposalId=${proposal.id}`);
      }
    });
  }

  const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "secondary",
    shortlisted: "default",
    accepted: "default",
    rejected: "destructive",
    withdrawn: "outline",
    expired: "outline",
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{influencerName}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {influencerNiche && (
              <span>{influencerNiche.replace("_", " ")}</span>
            )}
            {influencerFollowers && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />{" "}
                {influencerFollowers.toLocaleString()}
              </span>
            )}
            {influencerCity && influencerState && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {influencerCity},{" "}
                {influencerState}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {proposal.proposedRate && (
            <span className="font-semibold">
              ${centsToDollars(proposal.proposedRate)} AUD
            </span>
          )}
          <Badge variant={statusColors[proposal.status] ?? "secondary"}>
            {proposal.status}
          </Badge>
        </div>
      </div>

      {proposal.coverLetter && (
        <p className="text-sm text-muted-foreground">{proposal.coverLetter}</p>
      )}

      {proposal.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatusChange("shortlisted")}
          >
            Shortlist
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => handleStatusChange("accepted")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => handleStatusChange("rejected")}
          >
            Reject
          </Button>
        </div>
      )}

      {proposal.status === "shortlisted" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => handleStatusChange("accepted")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => handleStatusChange("rejected")}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProposalListProps {
  proposals: ProposalItemProps[];
}

export function ProposalList({ proposals }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            No proposals yet. Once influencers apply, they&apos;ll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Proposals ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((p, i) => (
          <div key={p.proposal.id}>
            {i > 0 && <Separator className="my-4" />}
            <ProposalItem {...p} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
