"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsAsRead } from "@/server/actions/notifications";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  unreadCount: number;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: NotificationBellProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              className="text-xs text-brand hover:underline disabled:opacity-50"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="cursor-pointer px-3 py-2.5"
              onClick={() => {
                if (n.link) router.push(n.link);
              }}
            >
              <div className="flex items-start gap-2 w-full">
                {!n.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                )}
                <div className={!n.read ? "" : "ml-4"}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString("en-AU")}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
