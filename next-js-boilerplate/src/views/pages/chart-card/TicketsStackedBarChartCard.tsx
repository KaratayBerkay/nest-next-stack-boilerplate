"use client";

import {
  Bar,
  CartesianGrid,
  Chart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceDatum {
  weekKey: string;
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

const TICKET_DATA: SourceDatum[] = [
  { weekKey: "chartCard10Week1", low: 42, medium: 28, high: 12, urgent: 4 },
  { weekKey: "chartCard10Week2", low: 38, medium: 31, high: 15, urgent: 6 },
  { weekKey: "chartCard10Week3", low: 46, medium: 26, high: 10, urgent: 3 },
  { weekKey: "chartCard10Week4", low: 51, medium: 34, high: 14, urgent: 5 },
];

export function TicketsStackedBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = TICKET_DATA.map((item) => ({
    week: c[item.weekKey],
    low: item.low,
    medium: item.medium,
    high: item.high,
    urgent: item.urgent,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard10Title}</Typography>
        <div className="mt-5">
          <Chart type="bar" data={data} height={260}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="low"
              stackId="priority"
              name={c.chartCard10SeriesLow}
              fill="var(--success)"
            />
            <Bar
              dataKey="medium"
              stackId="priority"
              name={c.chartCard10SeriesMedium}
              fill="var(--info)"
            />
            <Bar
              dataKey="high"
              stackId="priority"
              name={c.chartCard10SeriesHigh}
              fill="var(--warning)"
            />
            <Bar
              dataKey="urgent"
              stackId="priority"
              name={c.chartCard10SeriesUrgent}
              fill="var(--error)"
              radius={[4, 4, 0, 0]}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
