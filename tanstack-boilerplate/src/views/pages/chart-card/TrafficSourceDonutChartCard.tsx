"use client";

import { Cell } from "recharts";
import { Chart, Pie, Tooltip } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceSlice {
  nameKey: string;
  valueKey: string;
  value: number;
}

const SOURCE_COLORS = [
  "var(--brand)",
  "var(--info)",
  "var(--success)",
  "var(--muted)",
] as const;

const SOURCE_DATA: SourceSlice[] = [
  { nameKey: "chartCard5Source1", valueKey: "chartCard5Source1Value", value: 9840 },
  { nameKey: "chartCard5Source2", valueKey: "chartCard5Source2Value", value: 6720 },
  { nameKey: "chartCard5Source3", valueKey: "chartCard5Source3Value", value: 4980 },
  { nameKey: "chartCard5Source4", valueKey: "chartCard5Source4Value", value: 3060 },
];

export function TrafficSourceDonutChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = SOURCE_DATA.map((slice) => ({
    name: c[slice.nameKey],
    value: slice.value,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard5Title}</Typography>
        <div className="relative mt-4">
          <Chart type="pie" data={data} height={220}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={88}
              paddingAngle={2}
            >
              {SOURCE_DATA.map((slice, index) => (
                <Cell
                  key={slice.nameKey}
                  fill={SOURCE_COLORS[index]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip />
          </Chart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-muted text-xs">{c.chartCard5CenterLabel}</span>
            <span className="text-xl font-semibold tracking-tight">
              {c.chartCard5TotalValue}
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          {SOURCE_DATA.map((slice, index) => (
            <div
              key={slice.nameKey}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[index] }}
                  aria-hidden="true"
                />
                {c[slice.nameKey]}
              </span>
              <span className="text-muted tabular-nums">{c[slice.valueKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
