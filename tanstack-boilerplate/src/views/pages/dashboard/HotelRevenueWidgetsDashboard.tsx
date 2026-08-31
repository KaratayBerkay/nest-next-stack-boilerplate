"use client";

import {
  IconBed,
  IconBuildingCommunity,
  IconCurrencyDollar,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Bar,
  CartesianGrid,
  Chart,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Cell } from "recharts";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

const BRAND = "var(--brand)" as const;
const INFO = "var(--info)" as const;
const SUCCESS = "var(--success)" as const;
const WARNING = "var(--warning)" as const;
const MUTED = "var(--muted)" as const;

const PIE_COLORS = [BRAND, INFO, SUCCESS, WARNING] as const;

interface MonthlyPoint {
  monthKey: string;
  value: number;
}

interface MappedMonthlyPoint extends Record<string, unknown> {
  month: string;
  value: number;
}

interface TrendPoint {
  dayKey: string;
  value: number;
}

interface MappedTrendPoint extends Record<string, unknown> {
  day: string;
  value: number;
}

interface SourceSlice {
  nameKey: string;
  value: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

const STATS: DashboardStat[] = [
  {
    icon: IconCurrencyDollar,
    trend: "up",
    labelKey: "dashboard15Stat1Label",
    valueKey: "dashboard15Stat1Value",
    deltaKey: "dashboard15Stat1Delta",
  },
  {
    icon: IconBed,
    trend: "up",
    labelKey: "dashboard15Stat2Label",
    valueKey: "dashboard15Stat2Value",
    deltaKey: "dashboard15Stat2Delta",
  },
  {
    icon: IconBuildingCommunity,
    trend: "up",
    labelKey: "dashboard15Stat3Label",
    valueKey: "dashboard15Stat3Value",
    deltaKey: "dashboard15Stat3Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "up",
    labelKey: "dashboard15Stat4Label",
    valueKey: "dashboard15Stat4Value",
    deltaKey: "dashboard15Stat4Delta",
  },
];

const MONTHLY_DATA: MonthlyPoint[] = [
  { monthKey: "dashboard15Month1", value: 38 },
  { monthKey: "dashboard15Month2", value: 42 },
  { monthKey: "dashboard15Month3", value: 39 },
  { monthKey: "dashboard15Month4", value: 51 },
  { monthKey: "dashboard15Month5", value: 47 },
  { monthKey: "dashboard15Month6", value: 58 },
];

const TREND_DATA: TrendPoint[] = [
  { dayKey: "dashboard15Day1", value: 14200 },
  { dayKey: "dashboard15Day2", value: 15600 },
  { dayKey: "dashboard15Day3", value: 14800 },
  { dayKey: "dashboard15Day4", value: 17100 },
  { dayKey: "dashboard15Day5", value: 19400 },
  { dayKey: "dashboard15Day6", value: 16900 },
  { dayKey: "dashboard15Day7", value: 21300 },
];

const SOURCE_DATA: SourceSlice[] = [
  { nameKey: "dashboard15Source1Label", value: 58 },
  { nameKey: "dashboard15Source2Label", value: 22 },
  { nameKey: "dashboard15Source3Label", value: 12 },
  { nameKey: "dashboard15Source4Label", value: 8 },
];

function getMonthlyData(d: DashboardMessages): MappedMonthlyPoint[] {
  return MONTHLY_DATA.map((point) => ({
    month: d[point.monthKey],
    value: point.value,
  }));
}

function getTrendData(d: DashboardMessages): MappedTrendPoint[] {
  return TREND_DATA.map((point) => ({
    day: d[point.dayKey],
    value: point.value,
  }));
}

function getSourceData(d: DashboardMessages): Record<string, unknown>[] {
  return SOURCE_DATA.map((slice) => ({
    name: d[slice.nameKey],
    value: slice.value,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function StatCard({ stat, d }: { stat: DashboardStat; d: DashboardMessages }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            getToneClasses(stat.trend),
          )}
        >
          <stat.icon size={18} aria-hidden="true" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            getToneClasses(stat.trend),
          )}
        >
          {d[stat.deltaKey]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="caption">{d[stat.labelKey]}</Typography>
        <span className="text-2xl font-semibold tracking-tight">
          {d[stat.valueKey]}
        </span>
      </div>
    </div>
  );
}

export function HotelRevenueWidgetsDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const monthlyData = getMonthlyData(d) as unknown as Record<string, unknown>[];
  const trendData = getTrendData(d) as unknown as Record<string, unknown>[];
  const sourceData = getSourceData(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard15Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard15Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Typography variant="h5">{d.dashboard15ChartTitle}</Typography>
              <span className="text-muted text-sm">
                {d.dashboard15ChartCaption}
              </span>
            </div>
            <Chart type="bar" data={monthlyData} height={260}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                vertical={false}
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                name={d.dashboard15SeriesRevenue}
                fill={BRAND}
                radius={[4, 4, 0, 0]}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
            <Typography variant="h5">{d.dashboard15DonutTitle}</Typography>
            <Chart type="pie" data={sourceData} height={240}>
              <Pie
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {SOURCE_DATA.map((slice, index) => (
                  <Cell
                    key={slice.nameKey}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </Chart>
            <div className="flex flex-col gap-2">
              {SOURCE_DATA.map((slice, index) => (
                <div
                  key={slice.nameKey}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted inline-flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                    {d[slice.nameKey]}
                  </span>
                  <span className="font-medium tabular-nums">
                    {d[`dashboard15Source${index + 1}Share`]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard15TrendTitle}</Typography>
            <span className="text-muted text-sm">
              {d.dashboard15TrendCaption}
            </span>
          </div>
          <Chart type="line" data={trendData} height={240}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={MUTED}
              vertical={false}
            />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              name={d.dashboard15SeriesTrend}
              stroke={BRAND}
              strokeWidth={2}
              dot={false}
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
