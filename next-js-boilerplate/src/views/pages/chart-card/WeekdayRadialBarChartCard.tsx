"use client";

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface DayDatum {
  dayKey: string;
  orders: number;
}

const PALETTE = [
  "var(--brand)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--error)",
  "var(--muted)",
  "var(--brand)",
] as const;

const WEEKDAY_DATA: DayDatum[] = [
  { dayKey: "chartCard19Day1", orders: 210 },
  { dayKey: "chartCard19Day2", orders: 248 },
  { dayKey: "chartCard19Day3", orders: 262 },
  { dayKey: "chartCard19Day4", orders: 288 },
  { dayKey: "chartCard19Day5", orders: 341 },
  { dayKey: "chartCard19Day6", orders: 396 },
  { dayKey: "chartCard19Day7", orders: 274 },
];

export function WeekdayRadialBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = WEEKDAY_DATA.map((item, index) => ({
    name: c[item.dayKey],
    orders: item.orders,
    fill: PALETTE[index],
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard19Title}</Typography>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={data}
                innerRadius="18%"
                outerRadius="100%"
                startAngle={180}
                endAngle={-180}
                barSize={10}
              >
                <RadialBar
                  dataKey="orders"
                  name={c.chartCard19SeriesLabel}
                  background={{ fill: "var(--surface)" }}
                  cornerRadius={5}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 self-center sm:grid-cols-1">
            {WEEKDAY_DATA.map((item, index) => (
              <div
                key={item.dayKey}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: PALETTE[index] }}
                  aria-hidden="true"
                />
                <span className="text-muted">{c[item.dayKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
