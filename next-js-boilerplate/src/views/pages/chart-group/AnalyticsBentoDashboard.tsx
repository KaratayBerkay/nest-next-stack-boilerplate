"use client";

import { IconTrendingUp, IconUsers, IconWallet } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Cell } from "recharts";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

const BRAND = "hsl(var(--brand))" as const;
const MUTED = "hsl(var(--muted))" as const;
const INFO = "hsl(var(--info))" as const;
const SUCCESS = "hsl(var(--success))" as const;
const WARNING = "hsl(var(--warning))" as const;

const GOAL_PROGRESS = 82 as const;

interface RevenuePoint {
  labelKey: string;
  revenue: number;
  expenses: number;
}

interface SourceSlice {
  labelKey: string;
  value: number;
  color: string;
}

interface OrderPoint {
  labelKey: string;
  orders: number;
}

interface UserPoint {
  labelKey: string;
  users: number;
}

interface DashboardStat {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: "up" | "down";
  icon: Icon;
}

const REVENUE_DATA: RevenuePoint[] = [
  { labelKey: "chartGroup14Month1", revenue: 42, expenses: 32 },
  { labelKey: "chartGroup14Month2", revenue: 38, expenses: 30 },
  { labelKey: "chartGroup14Month3", revenue: 58, expenses: 36 },
  { labelKey: "chartGroup14Month4", revenue: 52, expenses: 40 },
  { labelKey: "chartGroup14Month5", revenue: 66, expenses: 42 },
  { labelKey: "chartGroup14Month6", revenue: 78, expenses: 45 },
];

const TRAFFIC_SOURCES: SourceSlice[] = [
  { labelKey: "chartGroup14Source1", value: 42, color: BRAND },
  { labelKey: "chartGroup14Source2", value: 24, color: INFO },
  { labelKey: "chartGroup14Source3", value: 18, color: SUCCESS },
  { labelKey: "chartGroup14Source4", value: 16, color: WARNING },
];

const WEEKLY_ORDERS: OrderPoint[] = [
  { labelKey: "chartGroup14Day1", orders: 120 },
  { labelKey: "chartGroup14Day2", orders: 168 },
  { labelKey: "chartGroup14Day3", orders: 142 },
  { labelKey: "chartGroup14Day4", orders: 198 },
  { labelKey: "chartGroup14Day5", orders: 176 },
  { labelKey: "chartGroup14Day6", orders: 224 },
  { labelKey: "chartGroup14Day7", orders: 190 },
];

const ACTIVE_USERS: UserPoint[] = [
  { labelKey: "chartGroup14Month1", users: 3.2 },
  { labelKey: "chartGroup14Month2", users: 3.6 },
  { labelKey: "chartGroup14Month3", users: 4.1 },
  { labelKey: "chartGroup14Month4", users: 4.4 },
  { labelKey: "chartGroup14Month5", users: 5.2 },
  { labelKey: "chartGroup14Month6", users: 6.1 },
];

const STATS: DashboardStat[] = [
  {
    labelKey: "chartGroup14Stat1Label",
    valueKey: "chartGroup14Stat1Value",
    deltaKey: "chartGroup14Stat1Delta",
    trend: "up",
    icon: IconWallet,
  },
  {
    labelKey: "chartGroup14Stat2Label",
    valueKey: "chartGroup14Stat2Value",
    deltaKey: "chartGroup14Stat2Delta",
    trend: "up",
    icon: IconUsers,
  },
  {
    labelKey: "chartGroup14Stat3Label",
    valueKey: "chartGroup14Stat3Value",
    deltaKey: "chartGroup14Stat3Delta",
    trend: "down",
    icon: IconTrendingUp,
  },
];

function toLabeled<T extends { labelKey: string }>(
  rows: readonly T[],
  labels: Record<string, string>,
): Record<string, unknown>[] {
  return rows.map((row) => ({ ...row, label: labels[row.labelKey] }));
}

export function AnalyticsBentoDashboard() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const revenueData = toLabeled(REVENUE_DATA, cg);
  const trafficData = toLabeled(TRAFFIC_SOURCES, cg);
  const ordersData = toLabeled(WEEKLY_ORDERS, cg);
  const usersData = toLabeled(ACTIVE_USERS, cg);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup14Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup14Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted text-sm">{cg[stat.labelKey]}</span>
                <stat.icon
                  size={18}
                  className="text-brand shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  {cg[stat.valueKey]}
                </span>
                <span
                  className={cn(
                    "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                    stat.trend === "up"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error",
                  )}
                >
                  {cg[stat.deltaKey]}
                </span>
              </div>
            </div>
          ))}
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted text-sm">
                {cg.chartGroup14ProgressTitle}
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                {cg.chartGroup14ProgressValue}
              </span>
            </div>
            <div className="bg-surface-hover h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand h-full rounded-full"
                style={{ width: `${GOAL_PROGRESS}%` }}
              />
            </div>
            <span className="text-muted text-sm">
              {cg.chartGroup14ProgressLabel}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6 md:col-span-2 lg:col-span-2 lg:row-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {cg.chartGroup14AreaTitle}
              </span>
              <span className="text-muted text-xs">
                {cg.chartGroup14AreaPeriod}
              </span>
            </div>
            <Chart type="area" data={revenueData} height={280}>
              <defs>
                <linearGradient
                  id="chartGroup14RevenueFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient
                  id="chartGroup14ExpensesFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={MUTED} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={MUTED} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED, fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED, fontSize: 12 }}
                width={36}
              />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name={cg.chartGroup14RevenueSeries}
                stroke={BRAND}
                strokeWidth={2}
                fill="url(#chartGroup14RevenueFill)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={cg.chartGroup14ExpensesSeries}
                stroke={MUTED}
                strokeWidth={2}
                fill="url(#chartGroup14ExpensesFill)"
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
            <span className="text-sm font-medium">
              {cg.chartGroup14DonutTitle}
            </span>
            <Chart type="pie" data={trafficData} height={200}>
              <Pie
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                strokeWidth={0}
              >
                {TRAFFIC_SOURCES.map((slice) => (
                  <Cell key={slice.labelKey} fill={slice.color} />
                ))}
              </Pie>
            </Chart>
            <div className="flex flex-col gap-2.5">
              {TRAFFIC_SOURCES.map((slice) => (
                <div
                  key={slice.labelKey}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    {cg[slice.labelKey]}
                  </span>
                  <span className="text-muted text-sm">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
            <span className="text-sm font-medium">
              {cg.chartGroup14BarTitle}
            </span>
            <Chart type="bar" data={ordersData} height={220}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED, fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip cursor={{ fill: "hsl(var(--surface-hover))" }} />
              <Bar
                dataKey="orders"
                name={cg.chartGroup14OrdersSeries}
                fill={INFO}
                radius={[6, 6, 0, 0]}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6 md:col-span-2 lg:col-span-2">
            <span className="text-sm font-medium">
              {cg.chartGroup14LineTitle}
            </span>
            <Chart type="line" data={usersData} height={220}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED, fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: MUTED, fontSize: 12 }}
                width={36}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                name={cg.chartGroup14UsersSeries}
                stroke={SUCCESS}
                strokeWidth={2}
                dot={{ r: 3, fill: SUCCESS }}
              />
            </Chart>
          </div>
        </div>
      </div>
    </section>
  );
}
