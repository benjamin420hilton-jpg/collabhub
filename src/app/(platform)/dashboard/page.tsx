import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getBrandDashboardStats,
  getInfluencerDashboardStats,
} from "@/server/queries/dashboard";
import { BrandDashboard } from "@/components/profiles/brand-dashboard";
import { InfluencerDashboard } from "@/components/profiles/influencer-dashboard";
import type { BrandProfile, InfluencerProfile } from "@/types";

export default async function DashboardPage() {
  const data = await getUserWithProfile();

  if (!data || !data.role || !data.profile) {
    redirect("/onboarding");
  }

  const { user, profile, role } = data;

  if (role === "brand" && profile) {
    const stats = await getBrandDashboardStats(
      (profile as BrandProfile).id,
    );
    return <BrandDashboard user={user} profile={profile} stats={stats} />;
  }

  if (role === "influencer" && profile) {
    const stats = await getInfluencerDashboardStats(
      (profile as InfluencerProfile).id,
    );
    return (
      <InfluencerDashboard user={user} profile={profile} stats={stats} />
    );
  }

  redirect("/onboarding");
}
