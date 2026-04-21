import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getProposalsForInfluencer,
  getProposalsForBrand,
  getProposalStatusHistogram,
} from "@/server/queries/proposals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProposalsChart } from "@/components/proposals/proposals-chart";
import { Inbox, TrendingUp } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { BrandProfile, InfluencerProfile } from "@/types";

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  shortlisted: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  withdrawn: "border-gray-200 bg-gray-50 text-gray-600",
  expired: "border-gray-200 bg-gray-50 text-gray-600",
};

type ProposalRow = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  status: string;
  createdAt: Date;
  rate: number | null;
  counterpartyName: string;
};

export default async function ProposalsPage() {
  const data = await getUserWithProfile();
  if (!data || !data.profile || !data.role) redirect("/dashboard");

  let rows: ProposalRow[] = [];
  let histogram;

  if (data.role === "influencer") {
    const profile = data.profile as InfluencerProfile;
    const results = await getProposalsForInfluencer(profile.id);
    histogram = await getProposalStatusHistogram(profile.id, "influencer");

    rows = results.map((r) => ({
      id: r.proposal.id,
      campaignId: r.proposal.campaignId,
      campaignTitle: r.campaignTitle,
      status: r.proposal.status,
      createdAt: r.proposal.createdAt,
      rate: r.proposal.proposedRate,
      counterpartyName: "",
    }));
  } else if (data.role === "brand") {
    const profile = data.profile as BrandProfile;
    const results = await getProposalsForBrand(profile.id);
    histogram = await getProposalStatusHistogram(profile.id, "brand");

    rows = results.map((r) => ({
      id: r.proposal.id,
      campaignId: r.proposal.campaignId,
      campaignTitle: r.campaignTitle,
      status: r.proposal.status,
      createdAt: r.proposal.createdAt,
      rate: r.proposal.proposedRate,
      counterpartyName: r.influencerName,
    }));
  } else {
    redirect("/dashboard");
  }

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const accepted = rows.filter((r) => r.status === "accepted").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Proposals</h1>
        <p className="mt-1 text-muted-foreground">
          {data.role === "brand"
            ? "Proposals submitted to your campaigns."
            : "Proposals you've submitted to campaigns."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="animate-fade-in-up delay-100">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="mt-1 text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up delay-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-1 text-3xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up delay-300">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Accepted</p>
            <p className="mt-1 text-3xl font-bold">{accepted}</p>
          </CardContent>
        </Card>
        <Card id="accept-rate" className="animate-fade-in-up delay-400 scroll-mt-24">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Accept Rate</p>
            <p className="mt-1 text-3xl font-bold">{acceptRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accepted} of {total} accepted, {rejected} rejected
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-highlight" />
            Last 12 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {histogram && histogram.length > 0 ? (
            <ProposalsChart data={histogram} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No proposal activity yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up delay-400">
        <CardHeader>
          <CardTitle>
            {data.role === "brand" ? "All Proposals" : "Your Proposals"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="rounded-2xl bg-brand-light p-4">
                <Inbox className="size-8 text-brand" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {data.role === "brand"
                  ? "No proposals yet. Publish a campaign to start receiving them."
                  : "No proposals yet. Browse campaigns and submit your first one."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Campaign</th>
                    {data.role === "brand" && (
                      <th className="pb-3 pr-4 font-medium">Influencer</th>
                    )}
                    <th className="pb-3 pr-4 text-right font-medium">Rate</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 animate-fade-in-up"
                      style={{ animationDelay: `${(i + 4) * 60}ms` }}
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-AU")}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/campaigns/${r.campaignId}`}
                          className="hover:underline"
                        >
                          {r.campaignTitle}
                        </Link>
                      </td>
                      {data.role === "brand" && (
                        <td className="py-3 pr-4">{r.counterpartyName}</td>
                      )}
                      <td className="py-3 pr-4 text-right font-medium whitespace-nowrap">
                        {r.rate
                          ? `$${centsToDollars(r.rate).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-3">
                        <Badge className={statusColors[r.status] ?? ""}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
