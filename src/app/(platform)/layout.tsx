import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PlatformHeader } from "@/components/layout/platform-header";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/server/queries/notifications";
import { SyncUser } from "@/components/profiles/sync-user";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getUserWithProfile();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <SyncUser />
      </div>
    );
  }

  const { user, profile, role } = data;

  if (!user.onboardingCompleted && !role) {
    redirect("/onboarding");
  }

  if (!user.onboardingCompleted && role && !profile) {
    redirect(`/onboarding/${role}`);
  }

  const subscriptionTier =
    role === "brand" && profile && "subscriptionTier" in profile
      ? profile.subscriptionTier
      : undefined;

  // Fetch notifications
  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <div className="flex flex-1 flex-col">
        <PlatformHeader
          subscriptionTier={subscriptionTier}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
