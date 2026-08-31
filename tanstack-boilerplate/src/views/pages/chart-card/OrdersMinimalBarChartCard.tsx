"use client";

import { Bar, Chart, Tooltip, XAxis } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceDatum {
  dayKey: string;
  fulfilled: number;
  pending: number;
  cancelled: number;
}

const ORDER_DATA: SourceDatum[] = [
  { dayKey: "chartCard12Day1", fulfilled: 142, pending: 18, cancelled: 6 },
  { dayKey: "chartCard12Day2", fulfilled: 158, pending: 22, cancelled: 4 },
  { dayKey: "chartCard12Day3", fulfilled: 171, pending: 15, cancelled: 8 },
  { dayKey: "chartCard12Day4", fulfilled: 165, pending: 26, cancelled: 5 },
  { dayKey: "chartCard12Day5", fulfilled: 189, pending: 19, cancelled: 7 },
  { dayKey: "chartCard12Day6", fulfilled: 134, pending: 12, cancelled: 3 },
  { dayKey: "chartCard12Day7", fulfilled: 121, pending: 9, cancelled: 2 },
];

export function OrdersMinimalBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = ORDER_DATA.map((item) => ({
    day: c[item.dayKey],
    fulfilled: item.fulfilled,
    pending: item.pending,
    cancelled: item.cancelled,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-sm rounded-2xl border p-6 shadow-xs">
        <Typography variant="caption">{c.chartCard12StatLabel}</Typography>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="text-2xl font-semibold tracking-tight">
            {c.chartCard12StatValue}
          </span>
          <Typography variant="caption">{c.chartCard12Title}</Typography>
        </div>
        <div className="mt-4">
          <Chart type="bar" data={data} height={100}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Bar
              dataKey="fulfilled"
              stackId="status"
              name={c.chartCard12SeriesFulfilled}
              fill="var(--brand)"
            />
            <Bar
              dataKey="pending"
              stackId="status"
              name={c.chartCard12SeriesPending}
              fill="var(--warning)"
            />
            <Bar
              dataKey="cancelled"
              stackId="status"
              name={c.chartCard12SeriesCancelled}
              fill="var(--error)"
              radius={[2, 2, 0, 0]}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
