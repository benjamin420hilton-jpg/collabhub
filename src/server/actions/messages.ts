"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, messages, conversations, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendMessage(conversationId: string, content: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkId))
    .limit(1);

  if (!user) throw new Error("User not found");

  // Verify user is part of conversation
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) return { error: "Conversation not found" };
  if (conv.participantOneId !== user.id && conv.participantTwoId !== user.id)
    return { error: "Unauthorized" };

  // Send message
  await db.insert(messages).values({
    conversationId,
    senderId: user.id,
    content,
  });

  // Update conversation last message time
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Create notification for the other user
  const recipientId =
    conv.participantOneId === user.id
      ? conv.participantTwoId
      : conv.participantOneId;

  await db.insert(notifications).values({
    userId: recipientId,
    type: "new_message",
    title: "New Message",
    message: `${user.firstName ?? "Someone"} sent you a message`,
    link: `/messages/${conversationId}`,
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: true };
}

export async function markMessagesAsRead(conversationId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkId))
    .limit(1);

  if (!user) throw new Error("User not found");

  // Mark all messages from the OTHER person as read
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) return;

  const otherId =
    conv.participantOneId === user.id
      ? conv.participantTwoId
      : conv.participantOneId;

  await db
    .update(messages)
    .set({ read: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.senderId, otherId),
        eq(messages.read, false),
      ),
    );

  revalidatePath("/messages");
}
