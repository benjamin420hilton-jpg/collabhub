import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export async function getNotificationsForUser(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function getUnreadNotificationCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false)),
    );

  return result?.count ?? 0;
}
