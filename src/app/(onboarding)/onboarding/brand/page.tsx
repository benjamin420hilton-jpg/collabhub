import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { BrandProfileForm } from "@/components/profiles/brand-profile-form";

export default async function BrandOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.onboardingCompleted) redirect("/dashboard");
  if (user.role !== "brand") redirect("/onboarding");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Set Up Your Brand Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us about your business so influencers know who you are.
        </p>
      </div>
      <BrandProfileForm />
    </div>
  );
}
