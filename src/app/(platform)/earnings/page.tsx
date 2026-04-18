import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { getPaymentsForInfluencer } from "@/server/queries/payments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, ArrowDownRight } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { InfluencerProfile } from "@/types";

const statusColors: Record<string, string> = {
  succeeded: "border-green-300/50 bg-green-50 text-green-700",
  processing: "border-blue-300/50 bg-blue-50 text-blue-700",
  pending: "border-amber-300/50 bg-amber-50 text-amber-700",
  failed: "border-red-300/50 bg-red-50 text-red-700",
  refunded: "border-gray-300/50 bg-gray-50 text-gray-700",
  partially_refunded: "border-gray-300/50 bg-gray-50 text-gray-700",
};

const typeLabels: Record<string, string> = {
  milestone_release: "Milestone Release",
  platform_fee: "Platform Fee",
};

export default async function EarningsPage() {
  const data = await getUserWithProfile();
  if (!data || data.role !== "influencer" || !data.profile) {
    redirect("/dashboard");
  }

  const profile = data.profile as InfluencerProfile;
  const paymentResults = await getPaymentsForInfluencer(profile.id);

  const totalEarned = paymentResults
    .filter(
      (r) =>
        r.payment.type === "milestone_release" &&
        r.payment.status === "succeeded",
    )
    .reduce((sum, r) => sum + r.payment.amount, 0);

  const pending = paymentResults
    .filter(
      (r) =>
        r.payment.type === "milestone_release" &&
        r.payment.status === "processing",
    )
    .reduce((sum, r) => sum + r.payment.amount, 0);

  const platformFees = paymentResults
    .filter((r) => r.payment.type === "platform_fee")
    .reduce((sum, r) => sum + r.payment.amount, 0);

  const stats = [
    {
      label: "Total Earned",
      value: `$${centsToDollars(totalEarned).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: `$${centsToDollars(pending).toFixed(2)}`,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Platform Fees",
      value: `$${centsToDollars(platformFees).toFixed(2)}`,
      icon: ArrowDownRight,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="mt-1 text-muted-foreground">
          Track your income from campaigns and collaborations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 animate-fade-in-up delay-300">
          <div className="rounded-2xl bg-coral-light p-4">
            <TrendingUp className="size-8 text-coral" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No earnings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No earnings yet — land your first deal!
          </p>
        </div>
      ) : (
        <Card className="animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Campaign</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 text-right font-medium">
                      Amount
                    </th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentResults.map(
                    ({ payment, campaignTitle }, i) => (
                      <tr
                        key={payment.id}
                        className="border-b last:border-0 animate-fade-in-up"
                        style={{ animationDelay: `${(i + 4) * 80}ms` }}
                      >
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-AU",
                          )}
                        </td>
                        <td className="py-3 pr-4">{campaignTitle}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {typeLabels[payment.type] ?? payment.type}
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-medium whitespace-nowrap ${
                            payment.type === "platform_fee"
                              ? "text-amber-600"
                              : ""
                          }`}
                        >
                          {payment.type === "platform_fee" ? "-" : ""}$
                          {centsToDollars(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-3">
                          <Badge
                            className={
                              statusColors[payment.status] ?? ""
                            }
                          >
                            {payment.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
