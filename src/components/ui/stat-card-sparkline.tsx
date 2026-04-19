"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function StatCardSparkline({
  data,
  colorClass,
}: {
  data: number[];
  colorClass: string;
}) {
  return (
    <div className={cn("-mx-2 mt-3 h-10", colorClass)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((v, i) => ({ i, v }))}>
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
  );
}
