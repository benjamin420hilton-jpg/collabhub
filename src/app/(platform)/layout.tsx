import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PlatformHeader } from "@/components/layout/platform-header";
import { getUserWithProfile } from "@/server/queries/profiles";
import { SyncUser } from "@/components/profiles/sync-user";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Not authenticated at all — go to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getUserWithProfile();

  // Authenticated in Clerk but DB record not ready yet — show loading spinner
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <SyncUser />
      </div>
    );
  }

  const { user, profile, role } = data;

  // If user hasn't selected a role yet, send them to onboarding
  if (!user.onboardingCompleted && !role) {
    redirect("/onboarding");
  }

  // If user selected a role but hasn't completed profile, send to profile form
  if (!user.onboardingCompleted && role && !profile) {
    redirect(`/onboarding/${role}`);
  }

  const subscriptionTier =
    role === "brand" && profile && "subscriptionTier" in profile
      ? profile.subscriptionTier
      : undefined;

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <div className="flex flex-1 flex-col">
        <PlatformHeader subscriptionTier={subscriptionTier} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
