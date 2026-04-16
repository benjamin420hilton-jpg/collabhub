import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PlatformHeaderProps {
  subscriptionTier?: "free" | "pro";
}

export function PlatformHeader({ subscriptionTier }: PlatformHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-white/80 px-6 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-1 items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          {subscriptionTier === "pro" && (
            <Badge className="bg-gradient-violet border-0 text-white shadow-sm">
              Pro
            </Badge>
          )}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
