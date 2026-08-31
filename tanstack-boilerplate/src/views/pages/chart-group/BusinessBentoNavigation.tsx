"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconCurrencyDollar,
  IconShoppingCart,
  IconUserOff,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Cell } from "recharts";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

const BRAND = "var(--brand)" as const;
const MUTED = "var(--muted)" as const;
const INFO = "var(--info)" as const;
const SUCCESS = "var(--success)" as const;
const WARNING = "var(--warning)" as const;

const DEFAULT_NAV = "overview" as const;

interface NavItem {
  id: string;
  labelKey: string;
}

interface RevenuePoint {
  labelKey: string;
  revenue: number;
}

interface SegmentSlice {
  labelKey: string;
  value: number;
  color: string;
}

interface MonthlyPoint {
  labelKey: string;
  revenue: number;
}

interface SparkPoint {
  labelKey: string;
  sessions: number;
}

interface BusinessStat {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: "up" | "down";
  icon: Icon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", labelKey: "chartGroup15Nav1" },
  { id: "revenue", labelKey: "chartGroup15Nav2" },
  { id: "customers", labelKey: "chartGroup15Nav3" },
  { id: "reports", labelKey: "chartGroup15Nav4" },
];

const STATS: BusinessStat[] = [
  {
    labelKey: "chartGroup15Stat1Label",
    valueKey: "chartGroup15Stat1Value",
    deltaKey: "chartGroup15Stat1Delta",
    trend: "up",
    icon: IconCurrencyDollar,
  },
  {
    labelKey: "chartGroup15Stat2Label",
    valueKey: "chartGroup15Stat2Value",
    deltaKey: "chartGroup15Stat2Delta",
    trend: "up",
    icon: IconUsers,
  },
  {
    labelKey: "chartGroup15Stat3Label",
    valueKey: "chartGroup15Stat3Value",
    deltaKey: "chartGroup15Stat3Delta",
    trend: "up",
    icon: IconShoppingCart,
  },
  {
    labelKey: "chartGroup15Stat4Label",
    valueKey: "chartGroup15Stat4Value",
    deltaKey: "chartGroup15Stat4Delta",
    trend: "down",
    icon: IconUserOff,
  },
];

const REVENUE_GROWTH: RevenuePoint[] = [
  { labelKey: "chartGroup14Month1", revenue: 124 },
  { labelKey: "chartGroup14Month2", revenue: 138 },
  { labelKey: "chartGroup14Month3", revenue: 152 },
  { labelKey: "chartGroup14Month4", revenue: 148 },
  { labelKey: "chartGroup14Month5", revenue: 176 },
  { labelKey: "chartGroup14Month6", revenue: 198 },
];

const SEGMENTS: SegmentSlice[] = [
  { labelKey: "chartGroup15Segment1", value: 38, color: BRAND },
  { labelKey: "chartGroup15Segment2", value: 27, color: INFO },
  { labelKey: "chartGroup15Segment3", value: 21, color: SUCCESS },
  { labelKey: "chartGroup15Segment4", value: 14, color: WARNING },
];

const MONTHLY_REVENUE: MonthlyPoint[] = [
  { labelKey: "chartGroup14Month1", revenue: 96 },
  { labelKey: "chartGroup14Month2", revenue: 112 },
  { labelKey: "chartGroup14Month3", revenue: 108 },
  { labelKey: "chartGroup14Month4", revenue: 132 },
  { labelKey: "chartGroup14Month5", revenue: 128 },
  { labelKey: "chartGroup14Month6", revenue: 154 },
];

const SESSION_SPARK: SparkPoint[] = [
  { labelKey: "chartGroup14Day1", sessions: 42 },
  { labelKey: "chartGroup14Day2", sessions: 55 },
  { labelKey: "chartGroup14Day3", sessions: 48 },
  { labelKey: "chartGroup14Day4", sessions: 62 },
  { labelKey: "chartGroup14Day5", sessions: 58 },
  { labelKey: "chartGroup14Day6", sessions: 71 },
  { labelKey: "chartGroup14Day7", sessions: 84 },
];

function toLabeled<T extends { labelKey: string }>(
  rows: readonly T[],
  labels: Record<string, string>,
): Record<string, unknown>[] {
  return rows.map((row) => ({ ...row, label: labels[row.labelKey] }));
}

function handleNavSelect(
  nav: string,
  setActiveNav: Dispatch<SetStateAction<string>>,
) {
  setActiveNav(nav);
}

export function BusinessBentoNavigation() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [activeNav, setActiveNav] = useState<string>(DEFAULT_NAV);
  const revenueData = toLabeled(REVENUE_GROWTH, cg);
  const segmentData = toLabeled(SEGMENTS, cg);
  const monthlyData = toLabeled(MONTHLY_REVENUE, cg);
  const sparkData = toLabeled(SESSION_SPARK, cg);
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {cg.chartGroup15Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cg.chartGroup15Description}
            </Typography>
          </div>
          <nav
            aria-label={cg.chartGroup15NavLabel}
            className="bg-surface-hover flex w-fit flex-wrap gap-1 rounded-full p-1"
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full",
                  activeNav === item.id &&
                    "bg-surface text-fg hover:bg-surface shadow-sm",
                )}
                aria-pressed={activeNav === item.id}
                onClick={() => handleNavSelect(item.id, setActiveNav)}
              >
                {cg[item.labelKey]}
              </Button>
            ))}
          </nav>
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
                  className={cn(
                    "shrink-0",
                    stat.trend === "down" ? "text-warning" : "text-brand",
                  )}
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
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6 md:col-span-2 lg:col-span-2 lg:row-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {cg.chartGroup15LineTitle}
              </span>
              <span className="text-muted text-xs">
                {cg.chartGroup15LinePeriod}
              </span>
            </div>
            <Chart type="line" data={revenueData} height={300}>
              <defs>
                <linearGradient
                  id="chartGroup15RevenueStroke"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={INFO} />
                  <stop offset="100%" stopColor={BRAND} />
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
                width={40}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                name={cg.chartGroup15RevenueSeries}
                stroke="url(#chartGroup15RevenueStroke)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: BRAND }}
                activeDot={{ r: 5 }}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
            <span className="text-sm font-medium">
              {cg.chartGroup15DonutTitle}
            </span>
            <Chart type="pie" data={segmentData} height={200}>
              <Pie
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                strokeWidth={0}
              >
                {SEGMENTS.map((slice) => (
                  <Cell key={slice.labelKey} fill={slice.color} />
                ))}
              </Pie>
            </Chart>
            <div className="flex flex-col gap-2.5">
              {SEGMENTS.map((slice) => (
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
              {cg.chartGroup15BarTitle}
            </span>
            <Chart type="bar" data={monthlyData} height={220}>
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
              <Tooltip cursor={{ fill: "var(--surface-hover)" }} />
              <Bar
                dataKey="revenue"
                name={cg.chartGroup15MonthlySeries}
                fill={BRAND}
                radius={[6, 6, 0, 0]}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {cg.chartGroup15SparkTitle}
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                {cg.chartGroup15SparkValue}
              </span>
            </div>
            <Chart type="area" data={sparkData} height={140}>
              <defs>
                <linearGradient
                  id="chartGroup15SparkFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={INFO} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={INFO} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sessions"
                name={cg.chartGroup15SparkSeries}
                stroke={INFO}
                strokeWidth={2}
                fill="url(#chartGroup15SparkFill)"
              />
            </Chart>
          </div>
        </div>
      </div>
    </section>
  );
}
