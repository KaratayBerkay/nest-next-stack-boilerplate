"use client";

import { Cell } from "recharts";
import { Chart, Pie } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

const SCORE = 88 as const;
const MAX_SCORE = 100 as const;
const GAUGE_DATA = [
  { name: "score", value: SCORE },
  { name: "remainder", value: MAX_SCORE - SCORE },
];

export function HealthScoreGaugeChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = GAUGE_DATA as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-sm rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard17Title}</Typography>
        <div className="relative mt-4">
          <Chart type="pie" data={data} height={150}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={72}
              outerRadius={100}
              stroke="transparent"
            >
              <Cell fill="var(--success)" />
              <Cell fill="var(--surface)" />
            </Pie>
          </Chart>
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center gap-1">
            <span className="text-3xl font-semibold tracking-tight">
              {c.chartCard17ScoreValue}
              <span className="text-muted ml-1 text-sm font-normal">
                {c.chartCard17ScoreMax}
              </span>
            </span>
            <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-medium">
              {c.chartCard17RatingLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
