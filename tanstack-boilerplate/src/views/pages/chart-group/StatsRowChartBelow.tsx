"use client";

import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartGroupMessages,
  PagesWithChartGroupMessages,
} from "@/types/pages/chart-group/ChartGroupMessages-types";

interface StatItem {
  valueKey: string;
  labelKey: string;
}

interface MonthlySourceDatum {
  monthKey: string;
  revenue: number;
}

interface MonthlyDatum {
  month: string;
  revenue: number;
}

const STATS: StatItem[] = [
  { valueKey: "chartGroup7Stat1Value", labelKey: "chartGroup7Stat1Label" },
  { valueKey: "chartGroup7Stat2Value", labelKey: "chartGroup7Stat2Label" },
  { valueKey: "chartGroup7Stat3Value", labelKey: "chartGroup7Stat3Label" },
  { valueKey: "chartGroup7Stat4Value", labelKey: "chartGroup7Stat4Label" },
];

const MONTHLY_DATA: MonthlySourceDatum[] = [
  { monthKey: "chartGroup7Month1", revenue: 6200 },
  { monthKey: "chartGroup7Month2", revenue: 6800 },
  { monthKey: "chartGroup7Month3", revenue: 6400 },
  { monthKey: "chartGroup7Month4", revenue: 7600 },
  { monthKey: "chartGroup7Month5", revenue: 8200 },
  { monthKey: "chartGroup7Month6", revenue: 7900 },
  { monthKey: "chartGroup7Month7", revenue: 9100 },
  { monthKey: "chartGroup7Month8", revenue: 8700 },
  { monthKey: "chartGroup7Month9", revenue: 9600 },
  { monthKey: "chartGroup7Month10", revenue: 10400 },
  { monthKey: "chartGroup7Month11", revenue: 11200 },
  { monthKey: "chartGroup7Month12", revenue: 11800 },
];

function getMonthlyData(cg: ChartGroupMessages): MonthlyDatum[] {
  return MONTHLY_DATA.map((item) => ({
    month: cg[item.monthKey],
    revenue: item.revenue,
  }));
}

export function StatsRowChartBelow() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const monthlyData = getMonthlyData(cg) as unknown as Record<
    string,
    unknown
  >[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup7Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup7Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="border-border bg-surface flex flex-col gap-1 rounded-3xl border p-6"
            >
              <span className="text-3xl font-semibold tracking-tight">
                {cg[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{cg[stat.labelKey]}</span>
            </div>
          ))}
        </div>
        <div className="border-border bg-surface rounded-3xl border p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Typography variant="h3">{cg.chartGroup7CardTitle}</Typography>
            <span className="flex items-center gap-2 text-sm">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              {cg.chartGroup7Series1Label}
            </span>
          </div>
          <Chart type="area" data={monthlyData} height={320}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              name={cg.chartGroup7Series1Label}
              stroke="var(--brand)"
              fill="var(--brand)"
              fillOpacity={0.2}
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
