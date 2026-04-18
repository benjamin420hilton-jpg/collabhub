import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Users, Calendar } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { Campaign } from "@/types";

interface CampaignCardProps {
  campaign: Campaign;
  brandName: string;
}

export function CampaignCard({ campaign, brandName }: CampaignCardProps) {
  const budgetDisplay =
    campaign.type === "gifting"
      ? "Product Gifting"
      : campaign.budgetMin && campaign.budgetMax
        ? `$${centsToDollars(campaign.budgetMin)} – $${centsToDollars(campaign.budgetMax)} AUD`
        : campaign.budgetMax
          ? `Up to $${centsToDollars(campaign.budgetMax)} AUD`
          : campaign.budgetMin
            ? `From $${centsToDollars(campaign.budgetMin)} AUD`
            : "Budget TBD";

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="card-hover overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{campaign.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{brandName}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="border-coral/20 bg-coral-light text-coral-dark">
                {campaign.targetPlatform}
              </Badge>
              {campaign.type === "gifting" && (
                <Badge variant="outline" className="border-teal/30 text-teal-dark">
                  Gifting
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {campaign.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{budgetDisplay}</span>
            {campaign.targetLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-coral" /> {campaign.targetLocation}
              </span>
            )}
            {campaign.minFollowerCount && (
              <span className="flex items-center gap-1">
                <Users className="size-3 text-teal" /> {campaign.minFollowerCount.toLocaleString()}+ followers
              </span>
            )}
            {campaign.applicationDeadline && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3 text-coral" />{" "}
                {new Date(campaign.applicationDeadline).toLocaleDateString("en-AU")}
              </span>
            )}
          </div>
          {campaign.targetNiche && (
            <Badge variant="outline" className="text-xs border-border/60">
              {campaign.targetNiche.replace("_", " ")}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
