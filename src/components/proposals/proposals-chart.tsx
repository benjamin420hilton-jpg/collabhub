"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ProposalHistogramRow } from "@/server/queries/proposals";

const config: ChartConfig = {
  accepted: { label: "Accepted", color: "var(--color-teal, #14b8a6)" },
  pending: { label: "Pending", color: "var(--color-amber, #f59e0b)" },
  shortlisted: { label: "Shortlisted", color: "var(--color-blue, #3b82f6)" },
  rejected: { label: "Rejected", color: "var(--color-coral, #ef4444)" },
  withdrawn: { label: "Withdrawn", color: "var(--color-gray, #9ca3af)" },
  expired: { label: "Expired", color: "var(--color-gray-light, #d1d5db)" },
};

function formatMonth(month: string) {
  const [, m] = month.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return monthNames[parseInt(m, 10) - 1] ?? month;
}

export function ProposalsChart({ data }: { data: ProposalHistogramRow[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatMonth}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelFormatter={(v) => formatMonth(String(v))} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="accepted" stackId="a" fill="var(--color-accepted)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="shortlisted" stackId="a" fill="var(--color-shortlisted)" />
        <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" />
        <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" />
        <Bar dataKey="withdrawn" stackId="a" fill="var(--color-withdrawn)" />
        <Bar
          dataKey="expired"
          stackId="a"
          fill="var(--color-expired)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
