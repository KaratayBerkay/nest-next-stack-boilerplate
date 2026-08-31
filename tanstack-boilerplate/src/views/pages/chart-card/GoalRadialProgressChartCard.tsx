"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

const GOAL_VALUE = 76 as const;
const RING_DATA = [{ name: "goal", value: GOAL_VALUE, fill: "var(--brand)" }];

export function GoalRadialProgressChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-sm rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard16Title}</Typography>
        <div className="relative mt-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={RING_DATA}
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                barSize={16}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  background={{ fill: "var(--surface)" }}
                  cornerRadius={8}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-3xl font-semibold tracking-tight">
              {c.chartCard16CenterValue}
            </span>
            <span className="text-muted text-xs">{c.chartCard16CenterLabel}</span>
          </div>
        </div>
        <p className="text-muted mt-4 text-center text-sm">{c.chartCard16Caption}</p>
      </div>
    </div>
  );
}
