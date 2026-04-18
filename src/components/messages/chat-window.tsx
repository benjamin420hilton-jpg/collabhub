"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { sendMessage } from "@/server/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherUser: { name: string; avatar: string | null };
  initialMessages: ChatMessage[];
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  initialMessages,
}: ChatWindowProps) {
  const [isPending, startTransition] = useTransition();
  const [newMessage, setNewMessage] = useState("");
  const [msgs, setMsgs] = useState(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [msgs]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Update messages when initialMessages changes (from server refresh)
  useEffect(() => {
    setMsgs(initialMessages);
  }, [initialMessages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    setMsgs((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        content,
        senderId: currentUserId,
        senderName: "You",
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      await sendMessage(conversationId, content);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-4">
        <Link href="/messages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-ocean text-sm font-bold text-white">
          {otherUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{otherUser.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {msgs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation.
            </p>
          </div>
        )}
        {msgs.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-gradient-primary text-white rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          disabled={isPending || !newMessage.trim()}
          className="bg-gradient-primary text-white shadow-sm"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
