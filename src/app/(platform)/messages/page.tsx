import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/queries/profiles";
import { getConversationsForUser } from "@/server/queries/messages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const convos = await getConversationsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-1 text-muted-foreground">
          Chat with brands and influencers.
        </p>
      </div>

      {convos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 animate-fade-in-up delay-100">
          <div className="rounded-2xl bg-brand-light p-4">
            <MessageSquare className="size-8 text-brand" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When you connect with someone, your conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in-up delay-100">
          {convos.map(({ conversation, otherUser, lastMessage, unreadCount }) => (
            <Link key={conversation.id} href={`/messages/${conversation.id}`}>
              <Card className="card-hover border-border/60 mb-2">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                    {otherUser?.firstName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.createdAt).toLocaleDateString("en-AU")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content ?? "No messages yet"}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="bg-gradient-primary border-0 text-white text-xs ml-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
