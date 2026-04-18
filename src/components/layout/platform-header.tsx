import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "./notification-bell";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

interface PlatformHeaderProps {
  subscriptionTier?: "free" | "pro";
  notifications?: NotificationItem[];
  unreadCount?: number;
}

export function PlatformHeader({
  subscriptionTier,
  notifications = [],
  unreadCount = 0,
}: PlatformHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-white/80 px-6 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-1 items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          {subscriptionTier === "pro" && (
            <Badge className="bg-gradient-primary border-0 text-white shadow-sm">
              Pro
            </Badge>
          )}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
