import { auth } from "@clerk/nextjs/server";

function getAdminClerkIds(): Set<string> {
  const raw = process.env.ADMIN_CLERK_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminClerkId(clerkUserId: string | null | undefined): boolean {
  if (!clerkUserId) return false;
  return getAdminClerkIds().has(clerkUserId);
}

export async function getCurrentAdminClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return isAdminClerkId(userId) ? userId : null;
}

export async function requireAdmin(): Promise<string> {
  const clerkUserId = await getCurrentAdminClerkId();
  if (!clerkUserId) throw new Error("Forbidden: admin only");
  return clerkUserId;
}
