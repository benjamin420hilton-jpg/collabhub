import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/server/queries/profiles";
import { RoleSelector } from "@/components/profiles/role-selector";
import { SyncUser } from "@/components/profiles/sync-user";
import { StepIndicator } from "@/components/onboarding/step-indicator";

export default async function OnboardingPage() {
  const { userId } = await auth();

  // Not authenticated at all — send to sign-in
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();

  // User exists in Clerk but DB sync hasn't happened yet —
  // show a client component that retries
  if (!user) {
    return <SyncUser />;
  }

  if (user.onboardingCompleted) redirect("/dashboard");
  if (user.role) redirect(`/onboarding/${user.role}`);

  return (
    <div className="space-y-8">
      <StepIndicator current={1} />
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to CollabHub</h1>
        <p className="mt-2 text-muted-foreground">
          One quick question and we&apos;ll tailor everything to you.
        </p>
      </div>
      <RoleSelector />
      <p className="text-center text-xs text-muted-foreground">
        You can&apos;t change this later without support — pick the role that
        best describes you.
      </p>
    </div>
  );
}
