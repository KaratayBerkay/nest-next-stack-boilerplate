"use client";

import { IconTrendingUp, IconWallet } from "@tabler/icons-react";
import { Area, Chart } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

const SPARK_VALUES = [38, 42, 40, 45, 52, 49, 58, 55, 63, 68, 72, 84] as const;

function getSparkData(): Record<string, unknown>[] {
  return SPARK_VALUES.map((value) => ({ value }));
}

export function RevenueTrendSparkChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = getSparkData();

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <span className="border-border bg-surface flex size-9 items-center justify-center rounded-full border">
            <IconWallet size={18} className="text-brand" aria-hidden="true" />
          </span>
          <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <IconTrendingUp size={14} aria-hidden="true" />
            {c.chartCard1DeltaValue}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <Typography variant="caption">{c.chartCard1Title}</Typography>
          <span className="text-3xl font-semibold tracking-tight">
            {c.chartCard1StatValue}
          </span>
          <span className="text-muted text-xs">{c.chartCard1Period}</span>
        </div>
        <div className="mt-4">
          <Chart type="area" data={data} height={72}>
            <defs>
              <linearGradient id="chartCard1Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--brand)"
              strokeWidth={2}
              fill="url(#chartCard1Fill)"
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
