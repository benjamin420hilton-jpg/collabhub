import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { BrandProfileForm } from "@/components/profiles/brand-profile-form";
import { StepIndicator } from "@/components/onboarding/step-indicator";

export default async function BrandOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.onboardingCompleted) redirect("/dashboard");
  if (user.role !== "brand") redirect("/onboarding");

  return (
    <div className="space-y-8">
      <StepIndicator current={2} />
      <div className="text-center">
        <h1 className="text-3xl font-bold">Tell creators who you are</h1>
        <p className="mt-2 text-muted-foreground">
          Creators check your profile before applying to your briefs. A solid
          bio gets you better applications — you can always add more later.
        </p>
      </div>
      <BrandProfileForm />
    </div>
  );
}
