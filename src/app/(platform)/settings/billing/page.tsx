import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BillingPage } from "@/components/billing/billing-page";
import { InfluencerBillingPage } from "@/components/billing/influencer-billing-page";
import type { BrandProfile, InfluencerProfile } from "@/types";

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await getUserWithProfile();
  if (!data || !data.profile || !data.role) redirect("/dashboard");

  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showCanceled = params.canceled === "true";

  if (data.role === "influencer") {
    return (
      <InfluencerBillingPage
        profile={data.profile as InfluencerProfile}
        showSuccess={showSuccess}
        showCanceled={showCanceled}
      />
    );
  }

  const profile = data.profile as BrandProfile;
  let subscription = null;
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.brandProfileId, profile.id))
    .limit(1);
  if (sub) subscription = sub;

  return (
    <BillingPage
      profile={profile}
      subscription={subscription}
      showSuccess={showSuccess}
      showCanceled={showCanceled}
    />
  );
}
