import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { InfluencerProfileForm } from "@/components/profiles/influencer-profile-form";
import { StepIndicator } from "@/components/onboarding/step-indicator";

export default async function InfluencerOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.onboardingCompleted) redirect("/dashboard");
  if (user.role !== "influencer") redirect("/onboarding");

  return (
    <div className="space-y-8">
      <StepIndicator current={2} />
      <div className="text-center">
        <h1 className="text-3xl font-bold">Set up your creator profile</h1>
        <p className="mt-2 text-muted-foreground">
          This is what brands see when they land on your media kit. You can
          refine everything later from Settings.
        </p>
      </div>
      <InfluencerProfileForm />
    </div>
  );
}
