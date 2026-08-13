"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCalendarMonth,
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
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

type Range = "7d" | "30d" | "90d";

interface RevenuePoint {
  labelKey: string;
  revenue: number;
  expenses: number;
}

interface MappedRevenuePoint extends Record<string, unknown> {
  label: string;
  revenue: number;
  expenses: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface RangeOption {
  value: Range;
  labelKey: string;
}

const BRAND = "hsl(var(--brand))" as const;
const MUTED = "hsl(var(--muted))" as const;

const RANGE_OPTIONS: RangeOption[] = [
  { value: "7d", labelKey: "dashboard1Range7d" },
  { value: "30d", labelKey: "dashboard1Range30d" },
  { value: "90d", labelKey: "dashboard1Range90d" },
];

const REVENUE_BY_RANGE: Record<Range, RevenuePoint[]> = {
  "7d": [
    { labelKey: "dashboard1Day1", revenue: 4100, expenses: 2900 },
    { labelKey: "dashboard1Day2", revenue: 5200, expenses: 3300 },
    { labelKey: "dashboard1Day3", revenue: 3800, expenses: 2700 },
    { labelKey: "dashboard1Day4", revenue: 6100, expenses: 3600 },
    { labelKey: "dashboard1Day5", revenue: 5400, expenses: 3100 },
    { labelKey: "dashboard1Day6", revenue: 7200, expenses: 4200 },
    { labelKey: "dashboard1Day7", revenue: 6600, expenses: 3900 },
  ],
  "30d": [
    { labelKey: "dashboard1Week1", revenue: 21400, expenses: 14200 },
    { labelKey: "dashboard1Week2", revenue: 24800, expenses: 16100 },
    { labelKey: "dashboard1Week3", revenue: 22900, expenses: 15500 },
    { labelKey: "dashboard1Week4", revenue: 27300, expenses: 17800 },
    { labelKey: "dashboard1Week5", revenue: 30100, expenses: 19300 },
  ],
  "90d": [
    { labelKey: "dashboard1Month1", revenue: 68200, expenses: 47100 },
    { labelKey: "dashboard1Month2", revenue: 75900, expenses: 51200 },
    { labelKey: "dashboard1Month3", revenue: 71600, expenses: 48900 },
    { labelKey: "dashboard1Month4", revenue: 84200, expenses: 55300 },
    { labelKey: "dashboard1Month5", revenue: 91800, expenses: 59200 },
    { labelKey: "dashboard1Month6", revenue: 102400, expenses: 63800 },
  ],
};

const STATS: DashboardStat[] = [
  {
    icon: IconWallet,
    trend: "up",
    labelKey: "dashboard1Stat1Label",
    valueKey: "dashboard1Stat1Value",
    deltaKey: "dashboard1Stat1Delta",
  },
  {
    icon: IconShoppingCart,
    trend: "down",
    labelKey: "dashboard1Stat2Label",
    valueKey: "dashboard1Stat2Value",
    deltaKey: "dashboard1Stat2Delta",
  },
  {
    icon: IconUsers,
    trend: "up",
    labelKey: "dashboard1Stat3Label",
    valueKey: "dashboard1Stat3Value",
    deltaKey: "dashboard1Stat3Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "up",
    labelKey: "dashboard1Stat4Label",
    valueKey: "dashboard1Stat4Value",
    deltaKey: "dashboard1Stat4Delta",
  },
];

function getChartData(
  d: DashboardMessages,
  range: Range,
): MappedRevenuePoint[] {
  return REVENUE_BY_RANGE[range].map((point) => ({
    label: d[point.labelKey],
    revenue: point.revenue,
    expenses: point.expenses,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function getRangeLabelKey(range: Range): string {
  const option = RANGE_OPTIONS.find((item) => item.value === range);
  return option?.labelKey ?? RANGE_OPTIONS[1].labelKey;
}

function handleRangeSelect(
  range: Range,
  setRange: Dispatch<SetStateAction<Range>>,
) {
  setRange(range);
}

function StatCard({ stat, d }: { stat: DashboardStat; d: DashboardMessages }) {
  const IconArrow = stat.trend === "up" ? IconArrowUpRight : IconArrowDownRight;
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
    </div>
  );
}

export function RevenueDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [range, setRange] = useState<Range>("30d");
  const chartData = getChartData(d, range);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {d.dashboard1Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {d.dashboard1Description}
            </Typography>
          </div>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={range === option.value ? "default" : "outline"}
                onClick={() => handleRangeSelect(option.value, setRange)}
              >
                {d[option.labelKey]}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard1ChartTitle}</Typography>
            <span className="text-muted flex items-center gap-2 text-sm">
              <IconCalendarMonth size={16} aria-hidden="true" />
              {d[getRangeLabelKey(range)]}
            </span>
          </div>
          <Chart type="area" data={chartData} height={300}>
            <defs>
              <linearGradient
                id="dashboard1RevenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="dashboard1ExpensesGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={MUTED} stopOpacity={0.3} />
                <stop offset="100%" stopColor={MUTED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name={d.dashboard1SeriesRevenue}
              stroke={BRAND}
              fill="url(#dashboard1RevenueGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name={d.dashboard1SeriesExpenses}
              stroke={MUTED}
              fill="url(#dashboard1ExpensesGradient)"
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
