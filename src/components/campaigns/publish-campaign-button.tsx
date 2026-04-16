"use client";

import { useTransition } from "react";
import { publishCampaign } from "@/server/actions/campaigns";
import { Button } from "@/components/ui/button";

interface PublishCampaignButtonProps {
  campaignId: string;
}

export function PublishCampaignButton({ campaignId }: PublishCampaignButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      await publishCampaign(campaignId);
    });
  }

  return (
    <Button onClick={handlePublish} disabled={isPending}>
      {isPending ? "Publishing..." : "Publish Campaign"}
    </Button>
  );
}
