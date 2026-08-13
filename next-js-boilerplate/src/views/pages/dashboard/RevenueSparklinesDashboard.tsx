"use client";

import {
  IconActivity,
  IconArrowDownRight,
  IconArrowUpRight,
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Area,
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

const BRAND = "hsl(var(--brand))" as const;
const INFO = "hsl(var(--info))" as const;
const SUCCESS = "hsl(var(--success))" as const;
const WARNING = "hsl(var(--warning))" as const;

interface WeeklyPoint {
  dayKey: string;
  revenue: number;
}

interface MappedWeeklyPoint extends Record<string, unknown> {
  day: string;
  revenue: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  spark: number[];
  color: string;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface TopProduct {
  nameKey: string;
  revenueKey: string;
  share: number;
}

const WEEKLY_DATA: WeeklyPoint[] = [
  { dayKey: "dashboard3Day1", revenue: 12400 },
  { dayKey: "dashboard3Day2", revenue: 13200 },
  { dayKey: "dashboard3Day3", revenue: 11800 },
  { dayKey: "dashboard3Day4", revenue: 14500 },
  { dayKey: "dashboard3Day5", revenue: 15900 },
  { dayKey: "dashboard3Day6", revenue: 14200 },
  { dayKey: "dashboard3Day7", revenue: 17100 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconWallet,
    trend: "up",
    spark: [12, 18, 14, 21, 19, 26, 24, 32],
    color: BRAND,
    labelKey: "dashboard3Stat1Label",
    valueKey: "dashboard3Stat1Value",
    deltaKey: "dashboard3Stat1Delta",
  },
  {
    icon: IconUsers,
    trend: "up",
    spark: [8, 9, 13, 11, 15, 14, 18, 16],
    color: INFO,
    labelKey: "dashboard3Stat2Label",
    valueKey: "dashboard3Stat2Value",
    deltaKey: "dashboard3Stat2Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "up",
    spark: [5, 7, 6, 8, 9, 8, 10, 12],
    color: SUCCESS,
    labelKey: "dashboard3Stat3Label",
    valueKey: "dashboard3Stat3Value",
    deltaKey: "dashboard3Stat3Delta",
  },
  {
    icon: IconShoppingCart,
    trend: "down",
    spark: [7, 6, 7, 5, 6, 4, 5, 4],
    color: WARNING,
    labelKey: "dashboard3Stat4Label",
    valueKey: "dashboard3Stat4Value",
    deltaKey: "dashboard3Stat4Delta",
  },
];

const TOP_PRODUCTS: TopProduct[] = [
  {
    nameKey: "dashboard3Product1Name",
    revenueKey: "dashboard3Product1Revenue",
    share: 38,
  },
  {
    nameKey: "dashboard3Product2Name",
    revenueKey: "dashboard3Product2Revenue",
    share: 28,
  },
  {
    nameKey: "dashboard3Product3Name",
    revenueKey: "dashboard3Product3Revenue",
    share: 22,
  },
  {
    nameKey: "dashboard3Product4Name",
    revenueKey: "dashboard3Product4Revenue",
    share: 16,
  },
];

function getWeeklyData(d: DashboardMessages): MappedWeeklyPoint[] {
  return WEEKLY_DATA.map((point) => ({
    day: d[point.dayKey],
    revenue: point.revenue,
  }));
}

function getSparkData(stat: DashboardStat): Record<string, unknown>[] {
  return stat.spark.map((value) => ({ value }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function StatCard({ stat, d }: { stat: DashboardStat; d: DashboardMessages }) {
  const IconArrow = stat.trend === "up" ? IconArrowUpRight : IconArrowDownRight;
  const sparkData = getSparkData(stat);
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
          <IconArrow size={14} aria-hidden="true" />
          {d[stat.deltaKey]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="caption">{d[stat.labelKey]}</Typography>
        <span className="text-2xl font-semibold tracking-tight">
          {d[stat.valueKey]}
        </span>
      </div>
      <Chart type="line" data={sparkData} height={64}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={stat.color}
          strokeWidth={2}
          dot={false}
        />
      </Chart>
    </div>
  );
}

function TopProductsCard({ d }: { d: DashboardMessages }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="h5">{d.dashboard3ProductsTitle}</Typography>
        <IconActivity size={18} className="text-muted" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-5">
        {TOP_PRODUCTS.map((product) => (
          <div key={product.nameKey} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{d[product.nameKey]}</span>
              <span className="text-muted tabular-nums">
                {d[product.revenueKey]}
              </span>
            </div>
            <Progress value={product.share} size="sm" />
          </div>
        ))}
      </div>
      <div className="border-border border-t pt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">{d.dashboard3TotalLabel}</span>
          <span className="text-fg font-semibold tabular-nums">
            {d.dashboard3TotalValue}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RevenueSparklinesDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const weeklyData = getWeeklyData(d) as unknown as Record<string, unknown>[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard3Description}
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
              <Typography variant="h5">{d.dashboard3ChartTitle}</Typography>
              <span className="text-muted text-sm">
                {d.dashboard3ChartCaption}
              </span>
            </div>
            <Chart type="area" data={weeklyData} height={280}>
              <defs>
                <linearGradient
                  id="dashboard3WeeklyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                name={d.dashboard3ChartSeries}
                stroke={BRAND}
                fill="url(#dashboard3WeeklyGradient)"
              />
            </Chart>
          </div>
          <TopProductsCard d={d} />
        </div>
      </div>
    </section>
  );
}
