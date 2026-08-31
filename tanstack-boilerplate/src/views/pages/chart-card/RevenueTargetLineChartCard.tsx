"use client";

import { ReferenceLine } from "recharts";
import { IconTrendingUp } from "@tabler/icons-react";
import { CartesianGrid, Chart, Line, Tooltip, XAxis, YAxis } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

const TARGET_VALUE = 60000 as const;

interface SourceDatum {
  monthKey: string;
  revenue: number;
}

const REVENUE_DATA: SourceDatum[] = [
  { monthKey: "chartCard25Month1", revenue: 41000 },
  { monthKey: "chartCard25Month2", revenue: 46500 },
  { monthKey: "chartCard25Month3", revenue: 52000 },
  { monthKey: "chartCard25Month4", revenue: 55800 },
  { monthKey: "chartCard25Month5", revenue: 61200 },
  { monthKey: "chartCard25Month6", revenue: 68400 },
];

export function RevenueTargetLineChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = REVENUE_DATA.map((item) => ({
    month: c[item.monthKey],
    revenue: item.revenue,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard25Title}</Typography>
          <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <IconTrendingUp size={14} aria-hidden="true" />
            {c.chartCard25DeltaValue}
          </span>
        </div>
        <div className="mt-5">
          <Chart type="line" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <ReferenceLine
              y={TARGET_VALUE}
              stroke="var(--warning)"
              strokeDasharray="4 4"
              label={{
                value: c.chartCard25TargetLabel,
                position: "insideTopRight",
                fill: "var(--muted)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name={c.chartCard25SeriesLabel}
              stroke="var(--brand)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
