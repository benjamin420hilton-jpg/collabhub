import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getBrandDashboardStats,
  getInfluencerDashboardStats,
} from "@/server/queries/dashboard";
import {
  getMonthlyProposalCount,
  FREE_TIER_MONTHLY_PROPOSAL_LIMIT,
} from "@/server/queries/proposals";
import { BrandDashboard } from "@/components/profiles/brand-dashboard";
import { InfluencerDashboard } from "@/components/profiles/influencer-dashboard";
import type { BrandProfile, InfluencerProfile, SocialAccount } from "@/types";

type InfluencerProfileWithSocials = InfluencerProfile & {
  socialAccounts: SocialAccount[];
};

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
    return <BrandDashboard user={user} profile={profile as BrandProfile} stats={stats} />;
  }

  if (role === "influencer" && profile) {
    const influencerProfile = profile as InfluencerProfileWithSocials;
    const [stats, monthlyApplications] = await Promise.all([
      getInfluencerDashboardStats(influencerProfile.id),
      getMonthlyProposalCount(influencerProfile.id),
    ]);
    return (
      <InfluencerDashboard
        user={user}
        profile={influencerProfile}
        socialAccounts={influencerProfile.socialAccounts ?? []}
        stats={stats}
        applicationsThisMonth={monthlyApplications}
        applicationsLimit={FREE_TIER_MONTHLY_PROPOSAL_LIMIT}
      />
    );
  }

  redirect("/onboarding");
}
