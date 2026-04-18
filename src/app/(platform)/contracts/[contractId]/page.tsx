import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calendar, Users, CheckCircle } from "lucide-react";
import { getContractById } from "@/server/queries/contracts";
import { getUserWithProfile } from "@/server/queries/profiles";
import { centsToDollars } from "@/lib/constants";
import { MilestoneTracker } from "@/components/contracts/milestone-tracker";
import { EscrowFunder } from "@/components/contracts/escrow-funder";
import { DeliveryTracker } from "@/components/contracts/delivery-tracker";
import { DisputeActions } from "@/components/contracts/dispute-actions";
import { db } from "@/db";
import { influencerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BrandProfile, InfluencerProfile } from "@/types";

const statusColors: Record<string, string> = {
  pending_escrow: "border-amber-300/50 bg-amber-50 text-amber-700",
  escrow_funded: "border-blue-300/50 bg-blue-50 text-blue-700",
  active: "border-coral/20 bg-coral-light text-coral-dark",
  completed: "border-green-300/50 bg-green-50 text-green-700",
  disputed: "border-red-300/50 bg-red-50 text-red-700",
  canceled: "border-gray-300/50 bg-gray-50 text-gray-700",
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const result = await getContractById(contractId);
  if (!result) notFound();

  const data = await getUserWithProfile();
  if (!data || !data.profile) redirect("/dashboard");

  const {
    contract,
    campaignTitle,
    brandName,
    influencerName,
    milestones,
  } = result;

  const isBrand =
    data.role === "brand" &&
    (data.profile as BrandProfile).id === contract.brandProfileId;
  const isInfluencer =
    data.role === "influencer" &&
    (data.profile as InfluencerProfile).id === contract.influencerProfileId;

  if (!isBrand && !isInfluencer) notFound();

  // Check if influencer has completed Stripe Connect for escrow funder
  let influencerOnboarded = false;
  if (isBrand && contract.status === "pending_escrow") {
    const [inf] = await db
      .select({ onboarded: influencerProfiles.stripeConnectOnboarded })
      .from(influencerProfiles)
      .where(eq(influencerProfiles.id, contract.influencerProfileId))
      .limit(1);
    influencerOnboarded = inf?.onboarded ?? false;
  }

  const completedMilestones = milestones.filter(
    (m) => m.status === "approved" || m.status === "paid",
  ).length;

  const feePercent = contract.platformFeeRate / 100;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{campaignTitle}</h1>
            <p className="mt-1 text-muted-foreground">
              <Users className="mr-1 inline size-4" />
              {isBrand
                ? `Contract with ${influencerName}`
                : `Contract with ${brandName}`}
            </p>
          </div>
          <Badge className={statusColors[contract.status] ?? ""}>
            {contract.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Financial Summary */}
      {contract.totalAmount > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-100">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-coral-light p-2">
                <DollarSign className="size-4 text-coral" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold">
                  ${centsToDollars(contract.totalAmount)} AUD
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-coral-light p-2">
                <DollarSign className="size-4 text-coral" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isBrand ? "Platform Fee" : "You Receive"}
                </p>
                <p className="text-lg font-bold">
                  {isBrand
                    ? `${feePercent}% ($${centsToDollars(contract.platformFeeAmount)})`
                    : `$${centsToDollars(contract.influencerPayout)} AUD`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-coral-light p-2">
                <Calendar className="size-4 text-coral" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-lg font-bold">
                  {completedMilestones}/{milestones.length} milestones
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      <div className="animate-fade-in-up delay-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">
            {milestones.length > 0
              ? Math.round((completedMilestones / milestones.length) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-coral-light">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{
              width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Escrow Funder — shown to brands when contract is pending escrow */}
      {isBrand && contract.status === "pending_escrow" && (
        <div className="animate-fade-in-up delay-200">
          <EscrowFunder
            contractId={contract.id}
            totalAmount={contract.totalAmount}
            influencerOnboarded={influencerOnboarded}
          />
        </div>
      )}

      {/* Funded success banner */}
      {contract.status === "active" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 animate-fade-in-up delay-200">
          <CheckCircle className="size-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Escrow funded — contract is active
          </span>
        </div>
      )}

      {/* Delivery Tracker — for product exchange contracts */}
      <div className="animate-fade-in-up delay-300">
        <DeliveryTracker
          contractId={contract.id}
          deliveryStatus={contract.deliveryStatus}
          trackingNumber={contract.shippingTrackingNumber}
          productDescription={contract.productDescription}
          isBrand={isBrand}
          deliveryConfirmedAt={contract.deliveryConfirmedAt}
        />
      </div>

      {/* Milestone Tracker */}
      <div className="animate-fade-in-up delay-300">
        <MilestoneTracker
          milestones={milestones}
          isBrand={isBrand}
          contractId={contract.id}
        />
      </div>

      {/* Dispute Actions */}
      <div className="animate-fade-in-up delay-400">
        <DisputeActions
          contractId={contract.id}
          status={contract.status}
          isBrand={isBrand}
        />
      </div>
    </div>
  );
}
