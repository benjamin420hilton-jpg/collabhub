"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
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
  trend?: number[];
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
  trend,
  className,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-border/50 shadow-sm",
        href &&
          "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="px-6 pt-6 pb-5">
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
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        </div>
        {trend && trend.length > 1 && (
          <div className={cn("-mx-2 mt-3 h-10", iconColor)}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((v, i) => ({ i, v }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
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
