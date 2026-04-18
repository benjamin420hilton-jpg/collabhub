import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { ConnectSetup } from "@/components/payments/connect-setup";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import type { InfluencerProfile } from "@/types";

export default async function PaymentSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await getUserWithProfile();
  if (!data || data.role !== "influencer" || !data.profile) {
    redirect("/dashboard");
  }

  const profile = data.profile as InfluencerProfile;
  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showRefresh = params.refresh === "true";

  const hasAccount = !!profile.stripeConnectAccountId;
  const isOnboarded = !!profile.stripeConnectOnboarded;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how you receive payments for your collaborations.
        </p>
      </div>

      {showSuccess && (
        <Card className="border-green-200 bg-green-50 animate-fade-in-down">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle className="size-5 text-green-600 shrink-0" />
            <p className="font-medium text-green-800">
              Payment setup complete! You&apos;re ready to receive payments.
            </p>
          </CardContent>
        </Card>
      )}

      {showRefresh && (
        <Card className="border-amber-200 bg-amber-50 animate-fade-in-down">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="size-5 text-amber-600 shrink-0" />
            <p className="font-medium text-amber-800">
              Please complete your payment setup to start receiving payments.
            </p>
          </CardContent>
        </Card>
      )}

      <ConnectSetup isOnboarded={isOnboarded} hasAccount={hasAccount} />
    </div>
  );
}
