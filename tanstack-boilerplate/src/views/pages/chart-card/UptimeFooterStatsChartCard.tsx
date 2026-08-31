"use client";

import { Area, CartesianGrid, Chart, Tooltip, XAxis, YAxis } from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface DayDatum {
  labelKey: string;
  uptime: number;
}

const UPTIME_DATA: DayDatum[] = [
  { labelKey: "chartCard7Day1", uptime: 99.98 },
  { labelKey: "chartCard7Day2", uptime: 99.95 },
  { labelKey: "chartCard7Day3", uptime: 99.99 },
  { labelKey: "chartCard7Day4", uptime: 99.82 },
  { labelKey: "chartCard7Day5", uptime: 99.97 },
  { labelKey: "chartCard7Day6", uptime: 100 },
  { labelKey: "chartCard7Day7", uptime: 99.96 },
];

export function UptimeFooterStatsChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = UPTIME_DATA.map((item) => ({
    label: c[item.labelKey],
    uptime: item.uptime,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard7Title}</Typography>
        <div className="mt-5">
          <Chart type="area" data={data} height={160}>
            <defs>
              <linearGradient id="chartCard7Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis domain={[99, 100]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="uptime"
              name={c.chartCard7SeriesLabel}
              stroke="var(--success)"
              fill="url(#chartCard7Fill)"
            />
          </Chart>
        </div>
        <div className="border-border mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted text-xs">{c.chartCard7StatAvgLabel}</span>
            <span className="text-sm font-semibold tabular-nums">
              {c.chartCard7StatAvgValue}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted text-xs">{c.chartCard7StatPeakLabel}</span>
            <span className="text-sm font-semibold tabular-nums">
              {c.chartCard7StatPeakValue}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted text-xs">
              {c.chartCard7StatIncidentsLabel}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {c.chartCard7StatIncidentsValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
