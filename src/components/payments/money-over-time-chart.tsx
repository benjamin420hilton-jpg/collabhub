"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { centsToDollars } from "@/lib/constants";

function formatMonth(month: string) {
  const [, m] = month.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return monthNames[parseInt(m, 10) - 1] ?? month;
}

interface MoneyOverTimeChartProps {
  data: { month: string; total: number }[];
  label: string;
  accent?: "brand" | "highlight";
}

export function MoneyOverTimeChart({
  data,
  label,
  accent = "highlight",
}: MoneyOverTimeChartProps) {
  const color = accent === "brand" ? "#8B5CF6" : "#EC4899";
  const config: ChartConfig = {
    total: { label, color },
  };

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <AreaChart data={data} accessibilityLayer margin={{ left: 8, right: 8 }}>
        <defs>
          <linearGradient id={`fill-${accent}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatMonth}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${centsToDollars(Number(v)).toLocaleString()}`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(v) => formatMonth(String(v))}
              formatter={(v) =>
                `$${centsToDollars(Number(v)).toLocaleString()} AUD`
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${accent})`}
        />
      </AreaChart>
    </ChartContainer>
  );
}
