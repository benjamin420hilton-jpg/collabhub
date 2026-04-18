"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Search,
  Settings,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const brandNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Contracts", href: "/contracts", icon: FileText },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Directory", href: "/directory", icon: Search },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
];

const influencerNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Find Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Contracts", href: "/contracts", icon: FileText },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  role: "brand" | "influencer" | null;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === "brand" ? brandNav : influencerNav;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
        <Link href="/dashboard" className="text-xl font-bold text-gradient-primary">
          CollabHub
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Badge
          variant="outline"
          className="w-fit border-coral/20 bg-coral-light text-coral-dark text-xs"
        >
          {role === "brand" ? "Brand Account" : "Influencer Account"}
        </Badge>
      </SidebarFooter>
    </Sidebar>
  );
}
