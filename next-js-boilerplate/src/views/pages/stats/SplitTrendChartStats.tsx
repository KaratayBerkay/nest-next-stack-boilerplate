"use client";

import { Area, Chart, Tooltip, XAxis } from "@/components/ui/Chart";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  PagesWithStatsMessages,
  StatsMessages,
} from "@/types/pages/stats/StatsMessages-types";

interface MiniStat {
  valueKey: string;
  labelKey: string;
}

const MINI_STATS: MiniStat[] = [
  { valueKey: "stats2Stat1Value", labelKey: "stats2Stat1Label" },
  { valueKey: "stats2Stat2Value", labelKey: "stats2Stat2Label" },
  { valueKey: "stats2Stat3Value", labelKey: "stats2Stat3Label" },
  { valueKey: "stats2Stat4Value", labelKey: "stats2Stat4Label" },
];

const TREND_VALUES = [
  { pointKey: "stats2Point1", revenue: 5400 },
  { pointKey: "stats2Point2", revenue: 6100 },
  { pointKey: "stats2Point3", revenue: 5800 },
  { pointKey: "stats2Point4", revenue: 7300 },
  { pointKey: "stats2Point5", revenue: 8600 },
  { pointKey: "stats2Point6", revenue: 9400 },
];

function getTrendData(sk: StatsMessages): Record<string, unknown>[] {
  return TREND_VALUES.map((point) => ({
    period: sk[point.pointKey],
    revenue: point.revenue,
  }));
}

export function SplitTrendChartStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;
  const trendData = getTrendData(sk);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.stats2Intro}</p>
          <div className="grid grid-cols-2 gap-4">
            {MINI_STATS.map((stat) => (
              <div
                key={stat.valueKey}
                className="border-border bg-surface rounded-xl border p-4"
              >
                <span className="text-fg block text-2xl font-semibold tracking-tight">
                  {sk[stat.valueKey]}
                </span>
                <span className="text-muted text-sm">{sk[stat.labelKey]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-border bg-surface rounded-2xl border p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-fg text-sm font-semibold">
              {sk.stats2ChartTitle}
            </p>
            <span className="flex items-center gap-2 text-xs">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              <span className="text-muted">{sk.stats2SeriesLabel}</span>
            </span>
          </div>
          <Chart type="area" data={trendData} height={260}>
            <defs>
              <linearGradient id="stats2Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              name={sk.stats2SeriesLabel}
              stroke="var(--brand)"
              strokeWidth={2}
              fill="url(#stats2Fill)"
            />
          </Chart>
          <p className="text-muted mt-4 text-xs">{sk.stats2ChartPeriod}</p>
        </div>
      </div>
    </section>
  );
}
