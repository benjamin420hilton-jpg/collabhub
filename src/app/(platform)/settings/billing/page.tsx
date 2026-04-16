import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BillingPage } from "@/components/billing/billing-page";
import type { BrandProfile } from "@/types";

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const data = await getUserWithProfile();
  if (!data || data.role !== "brand" || !data.profile) redirect("/dashboard");

  const profile = data.profile as BrandProfile;
  const params = await searchParams;

  // Get subscription details
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
      showSuccess={params.success === "true"}
      showCanceled={params.canceled === "true"}
    />
  );
}
