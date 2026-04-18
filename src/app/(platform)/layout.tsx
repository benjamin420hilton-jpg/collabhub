import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { TopNavbar } from "@/components/layout/top-navbar";
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark">
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

  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <div className="relative min-h-screen bg-sand">
      <TopNavbar
        role={role}
        subscriptionTier={subscriptionTier}
        notifications={notifications}
        unreadCount={unreadCount}
      />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
