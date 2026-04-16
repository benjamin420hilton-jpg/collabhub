import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { getMessagesForConversation } from "@/server/queries/messages";
import { markMessagesAsRead } from "@/server/actions/messages";
import { db } from "@/db";
import { conversations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ChatWindow } from "@/components/messages/chat-window";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) notFound();
  if (conv.participantOneId !== user.id && conv.participantTwoId !== user.id)
    notFound();

  const otherId =
    conv.participantOneId === user.id
      ? conv.participantTwoId
      : conv.participantOneId;

  const [otherUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, otherId))
    .limit(1);

  const msgs = await getMessagesForConversation(conversationId);

  // Mark messages as read
  await markMessagesAsRead(conversationId);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <ChatWindow
        conversationId={conversationId}
        currentUserId={user.id}
        otherUser={{
          name: `${otherUser?.firstName ?? ""} ${otherUser?.lastName ?? ""}`.trim() || "User",
          avatar: otherUser?.avatarUrl ?? null,
        }}
        initialMessages={msgs.map((m) => ({
          id: m.message.id,
          content: m.message.content,
          senderId: m.message.senderId,
          senderName: m.senderName ?? "User",
          createdAt: m.message.createdAt,
        }))}
      />
    </div>
  );
}
