"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

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

/**
 * Email-worthy notification types — these send a transactional email in
 * addition to creating the in-app notification. Chatty types (e.g. chat
 * messages) are deliberately excluded to avoid inbox fatigue.
 */
const EMAIL_TYPES = new Set<string>([
  "proposal_received",
  "proposal_accepted",
  "direct_offer_received",
  "escrow_funded",
  "milestone_submitted",
  "milestone_paid",
  "payment_failed",
  "contract_disputed",
  "campaign_approved",
  "campaign_rejected",
  "product_shipped",
  "product_delivered",
]);

const CTA_LABEL_BY_TYPE: Record<string, string> = {
  proposal_received: "Review proposal",
  proposal_accepted: "View contract",
  direct_offer_received: "See the offer",
  escrow_funded: "View contract",
  milestone_submitted: "Review submission",
  milestone_paid: "View payout",
  payment_failed: "Retry payment",
  contract_disputed: "Open contract",
  campaign_approved: "View campaign",
  campaign_rejected: "Edit campaign",
  product_shipped: "Track shipment",
  product_delivered: "View contract",
  new_message: "Open messages",
};

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

  if (!EMAIL_TYPES.has(type)) return;

  const [recipient] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!recipient?.email) return;

  await sendEmail({
    to: recipient.email,
    subject: title,
    title,
    body: message,
    ctaLabel: CTA_LABEL_BY_TYPE[type] ?? "Open CollabHub",
    ctaPath: link,
  });
}
