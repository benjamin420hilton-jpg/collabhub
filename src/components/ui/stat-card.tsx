import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  badge?: { text: string; className?: string };
  metadata?: string;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  badge,
  metadata,
  href,
  className,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "group relative h-full",
        href &&
          "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-xl p-2.5", iconBg)}>
            <Icon className={cn("size-5", iconColor)} />
          </div>
          {badge ? (
            <Badge className={badge.className}>{badge.text}</Badge>
          ) : metadata ? (
            <span className="text-xs text-muted-foreground">{metadata}</span>
          ) : href ? (
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          ) : null}
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
