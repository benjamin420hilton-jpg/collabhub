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

  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <div className="relative min-h-screen">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 size-[600px] rounded-full bg-violet/[0.03] blur-[100px]" />
        <div className="absolute top-1/2 -left-40 size-[500px] rounded-full bg-indigo/[0.03] blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 size-[400px] rounded-full bg-violet/[0.02] blur-[80px]" />
      </div>

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
