"use client";

import { useTransition, useState } from "react";
import {
  updateShippingTracking,
  confirmDelivery,
} from "@/server/actions/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, MapPin } from "lucide-react";

interface DeliveryTrackerProps {
  contractId: string;
  deliveryStatus: string | null;
  trackingNumber: string | null;
  productDescription: string | null;
  isBrand: boolean;
  deliveryConfirmedAt: Date | null;
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof Package }
> = {
  pending: {
    label: "Pending",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Truck,
  },
  in_transit: {
    label: "In Transit",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    badgeClass: "border-green-200 bg-green-50 text-green-700",
    icon: CheckCircle,
  },
  returned: {
    label: "Returned",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    icon: Package,
  },
};

const timelineSteps = [
  { key: "pending", label: "Pending", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

function getStepState(
  stepKey: string,
  currentStatus: string,
): "completed" | "active" | "upcoming" {
  const order = ["pending", "shipped", "in_transit", "delivered"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepKey);

  // in_transit counts the same as shipped for step display
  const effectiveCurrent =
    currentStatus === "in_transit" ? order.indexOf("shipped") : currentIndex;
  const effectiveStep =
    stepKey === "in_transit" ? order.indexOf("shipped") : stepIndex;

  if (effectiveStep < effectiveCurrent) return "completed";
  if (effectiveStep === effectiveCurrent) return "active";
  return "upcoming";
}

export function DeliveryTracker({
  contractId,
  deliveryStatus,
  trackingNumber,
  productDescription,
  isBrand,
  deliveryConfirmedAt,
}: DeliveryTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (deliveryStatus === null) return null;

  const config = statusConfig[deliveryStatus] ?? statusConfig.pending;

  function handleMarkShipped(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!tracking.trim()) {
      setError("Please enter a tracking number.");
      return;
    }

    startTransition(async () => {
      const result = await updateShippingTracking(contractId, tracking.trim());
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleConfirmDelivery() {
    setError(null);
    startTransition(async () => {
      const result = await confirmDelivery(contractId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="animate-fade-in-up delay-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-coral-light">
              <Package className="size-5 text-coral" />
            </div>
            <CardTitle>Product Delivery</CardTitle>
          </div>
          <Badge className={config.badgeClass}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Product description */}
        {productDescription && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Product
            </p>
            <p className="mt-1 text-sm">{productDescription}</p>
          </div>
        )}

        {/* Tracking number */}
        {trackingNumber && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-coral" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tracking Number
              </p>
            </div>
            <p className="mt-1 text-sm font-mono font-medium">
              {trackingNumber}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="py-2">
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => {
              const state = getStepState(step.key, deliveryStatus);
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                        state === "completed"
                          ? "border-green-400 bg-green-50"
                          : state === "active"
                            ? "border-coral bg-coral-light"
                            : "border-border bg-muted/30"
                      }`}
                    >
                      <StepIcon
                        className={`size-4 ${
                          state === "completed"
                            ? "text-green-600"
                            : state === "active"
                              ? "text-coral"
                              : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        state === "completed"
                          ? "text-green-700"
                          : state === "active"
                            ? "text-coral"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 rounded-full ${
                        getStepState(timelineSteps[i + 1].key, deliveryStatus) !== "upcoming"
                          ? "bg-green-300"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Brand: Mark as Shipped */}
        {isBrand && deliveryStatus === "pending" && (
          <form onSubmit={handleMarkShipped} className="space-y-3">
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Enter shipping tracking number..."
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
            >
              <Truck className="mr-2 size-4" />
              {isPending ? "Updating..." : "Mark as Shipped"}
            </Button>
          </form>
        )}

        {/* Influencer: Confirm Receipt */}
        {!isBrand &&
          (deliveryStatus === "shipped" || deliveryStatus === "in_transit") && (
            <Button
              onClick={handleConfirmDelivery}
              disabled={isPending}
              className="bg-gradient-primary text-white shadow-md shadow-coral/20 transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
            >
              <CheckCircle className="mr-2 size-4" />
              {isPending ? "Confirming..." : "Confirm Receipt"}
            </Button>
          )}

        {/* Delivery confirmed */}
        {deliveryStatus === "delivered" && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="size-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Delivery Confirmed
              </p>
              {deliveryConfirmedAt && (
                <p className="text-xs text-green-700">
                  Confirmed on{" "}
                  {new Date(deliveryConfirmedAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
