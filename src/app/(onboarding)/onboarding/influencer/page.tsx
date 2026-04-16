import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { InfluencerProfileForm } from "@/components/profiles/influencer-profile-form";

export default async function InfluencerOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.onboardingCompleted) redirect("/dashboard");
  if (user.role !== "influencer") redirect("/onboarding");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Set Up Your Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Tell brands about yourself and what you create.
        </p>
      </div>
      <InfluencerProfileForm />
    </div>
  );
}
