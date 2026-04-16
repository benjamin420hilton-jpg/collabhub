"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkId))
    .limit(1);

  if (!user) throw new Error("User not found");

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.id),
      ),
    );

  revalidatePath("/");
}

export async function markAllNotificationsAsRead() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkId))
    .limit(1);

  if (!user) throw new Error("User not found");

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.read, false),
      ),
    );

  revalidatePath("/");
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
) {
  await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    link: link ?? null,
  });
}
