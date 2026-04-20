"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  MessageSquare,
  Search,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";
import { NotificationBell } from "./notification-bell";

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const brandNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Contracts", href: "/contracts", icon: FileText },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Directory", href: "/directory", icon: Search },
];

const influencerNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Contracts", href: "/contracts", icon: FileText },
  { title: "Messages", href: "/messages", icon: MessageSquare },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

interface TopNavbarProps {
  role: "brand" | "influencer" | null;
  subscriptionTier?: "free" | "pro";
  notifications: NotificationItem[];
  unreadCount: number;
  isAdmin?: boolean;
}

export function TopNavbar({
  role,
  subscriptionTier,
  notifications,
  unreadCount,
  isAdmin = false,
}: TopNavbarProps) {
  const pathname = usePathname();
  const navItems = role === "brand" ? brandNav : influencerNav;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold text-gradient-primary">
            CollabHub
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-coral"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin/campaigns"
              className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors md:inline-flex ${
                pathname.startsWith("/admin")
                  ? "bg-coral/20 text-coral"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Shield className="size-3.5" />
              Admin
            </Link>
          )}
          {subscriptionTier === "pro" && (
            <Badge className="bg-gradient-primary border-0 text-white shadow-sm text-[10px] px-2 py-0.5">
              PRO
            </Badge>
          )}
          <Link
            href="/settings"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Settings className="size-4" />
          </Link>
          {role === "brand" && (
            <Link
              href="/settings/billing"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <CreditCard className="size-4" />
            </Link>
          )}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <div className="ml-1">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
