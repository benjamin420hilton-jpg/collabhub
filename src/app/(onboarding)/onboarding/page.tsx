import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/server/queries/profiles";
import { RoleSelector } from "@/components/profiles/role-selector";
import { SyncUser } from "@/components/profiles/sync-user";

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
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to CollabHub</h1>
        <p className="mt-2 text-muted-foreground">
          How would you like to use the platform?
        </p>
      </div>
      <RoleSelector />
    </div>
  );
}
