import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export async function getConversationsForUser(userId: string) {
  const results = await db
    .select({
      conversation: conversations,
      participantOneName: users.firstName,
      participantOneEmail: users.email,
      participantOneAvatar: users.avatarUrl,
      participantOneId: users.id,
    })
    .from(conversations)
    .innerJoin(users, eq(users.id, conversations.participantOneId))
    .where(
      or(
        eq(conversations.participantOneId, userId),
        eq(conversations.participantTwoId, userId),
      ),
    )
    .orderBy(desc(conversations.lastMessageAt));

  // For each conversation, get the other participant's info
  const enriched = await Promise.all(
    results.map(async (r) => {
      const otherId =
        r.conversation.participantOneId === userId
          ? r.conversation.participantTwoId
          : r.conversation.participantOneId;

      const [other] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, otherId))
        .limit(1);

      // Get last message
      const [lastMsg] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, r.conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Count unread
      const unread = await db
        .select({ id: messages.id })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, r.conversation.id),
            eq(messages.read, false),
            eq(messages.senderId, otherId),
          ),
        );

      return {
        conversation: r.conversation,
        otherUser: other,
        lastMessage: lastMsg ?? null,
        unreadCount: unread.length,
      };
    }),
  );

  return enriched;
}

export async function getMessagesForConversation(conversationId: string) {
  return db
    .select({
      message: messages,
      senderName: users.firstName,
      senderAvatar: users.avatarUrl,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function getOrCreateConversation(
  userOneId: string,
  userTwoId: string,
) {
  // Check if conversation exists
  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(
          eq(conversations.participantOneId, userOneId),
          eq(conversations.participantTwoId, userTwoId),
        ),
        and(
          eq(conversations.participantOneId, userTwoId),
          eq(conversations.participantTwoId, userOneId),
        ),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(conversations)
    .values({
      participantOneId: userOneId,
      participantTwoId: userTwoId,
    })
    .returning();

  return created;
}
