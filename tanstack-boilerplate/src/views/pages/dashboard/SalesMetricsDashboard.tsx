"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconChartBar,
  IconPackage,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Bar,
  CartesianGrid,
  Chart,
  Legend,
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
import { useScrollFadeX } from "@/hooks/useScrollFadeX";

const BRAND = "var(--brand)" as const;
const MUTED = "var(--muted)" as const;
const INFO = "var(--info)" as const;
const SUCCESS = "var(--success)" as const;
const WARNING = "var(--warning)" as const;

type Trend = "up" | "down";

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: Trend;
  icon: Icon;
}

interface MonthlyDatum {
  monthKey: string;
  current: number;
  previous: number;
}

interface CategoryDatum {
  labelKey: string;
  value: number;
  color: string;
}

interface ProductRow {
  nameKey: string;
  soldKey: string;
  revenueKey: string;
}

const STATS: StatDatum[] = [
  {
    labelKey: "dashboard8Stat1Label",
    valueKey: "dashboard8Stat1Value",
    deltaKey: "dashboard8Stat1Delta",
    trend: "up",
    icon: IconWallet,
  },
  {
    labelKey: "dashboard8Stat2Label",
    valueKey: "dashboard8Stat2Value",
    deltaKey: "dashboard8Stat2Delta",
    trend: "up",
    icon: IconPackage,
  },
  {
    labelKey: "dashboard8Stat3Label",
    valueKey: "dashboard8Stat3Value",
    deltaKey: "dashboard8Stat3Delta",
    trend: "up",
    icon: IconChartBar,
  },
];

const MONTHLY_DATA: MonthlyDatum[] = [
  { monthKey: "dashboard8Month1", current: 42, previous: 34 },
  { monthKey: "dashboard8Month2", current: 51, previous: 38 },
  { monthKey: "dashboard8Month3", current: 47, previous: 41 },
  { monthKey: "dashboard8Month4", current: 58, previous: 44 },
  { monthKey: "dashboard8Month5", current: 66, previous: 49 },
  { monthKey: "dashboard8Month6", current: 61, previous: 52 },
  { monthKey: "dashboard8Month7", current: 72, previous: 58 },
  { monthKey: "dashboard8Month8", current: 78, previous: 63 },
  { monthKey: "dashboard8Month9", current: 71, previous: 61 },
  { monthKey: "dashboard8Month10", current: 83, previous: 68 },
  { monthKey: "dashboard8Month11", current: 89, previous: 71 },
  { monthKey: "dashboard8Month12", current: 96, previous: 76 },
];

const CATEGORY_DATA: CategoryDatum[] = [
  { labelKey: "dashboard8Cat1Label", value: 42, color: BRAND },
  { labelKey: "dashboard8Cat2Label", value: 26, color: INFO },
  { labelKey: "dashboard8Cat3Label", value: 18, color: SUCCESS },
  { labelKey: "dashboard8Cat4Label", value: 14, color: WARNING },
];

const PRODUCT_ROWS: ProductRow[] = [
  {
    nameKey: "dashboard8Product1Name",
    soldKey: "dashboard8Product1Sold",
    revenueKey: "dashboard8Product1Revenue",
  },
  {
    nameKey: "dashboard8Product2Name",
    soldKey: "dashboard8Product2Sold",
    revenueKey: "dashboard8Product2Revenue",
  },
  {
    nameKey: "dashboard8Product3Name",
    soldKey: "dashboard8Product3Sold",
    revenueKey: "dashboard8Product3Revenue",
  },
  {
    nameKey: "dashboard8Product4Name",
    soldKey: "dashboard8Product4Sold",
    revenueKey: "dashboard8Product4Revenue",
  },
];

function resolveMonthly(d: Record<string, string>): Record<string, unknown>[] {
  return MONTHLY_DATA.map((row) => ({
    month: d[row.monthKey],
    current: row.current,
    previous: row.previous,
  }));
}

function resolveCategories(
  d: Record<string, string>,
): Record<string, unknown>[] {
  return CATEGORY_DATA.map((row) => ({
    label: d[row.labelKey],
    value: row.value,
  }));
}

export function SalesMetricsDashboard() {
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const monthlyData = resolveMonthly(d);
  const categoryData = resolveCategories(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface flex max-w-6xl flex-col gap-6 rounded-2xl border p-6 shadow-xs lg:mx-auto lg:p-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard8Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="flex flex-col gap-4 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted text-sm">{d[stat.labelKey]}</span>
                <span className="text-brand bg-brand/10 flex size-8 items-center justify-center rounded-lg">
                  <stat.icon size={18} aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold tracking-tight">
                  {d[stat.valueKey]}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    stat.trend === "up"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error",
                  )}
                >
                  {stat.trend === "up" ? (
                    <IconArrowUpRight size={14} aria-hidden="true" />
                  ) : (
                    <IconArrowDownRight size={14} aria-hidden="true" />
                  )}
                  {d[stat.deltaKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 lg:col-span-3">
            <span className="text-sm font-medium">
              {d.dashboard8ChartTitle}
            </span>
            <Chart type="bar" data={monthlyData} height={300}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                vertical={false}
              />
              <XAxis
                dataKey="month"
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
              <Tooltip cursor={{ fill: "var(--surface-hover)" }} />
              <Legend />
              <Bar
                dataKey="current"
                name={d.dashboard8SeriesCurrent}
                fill={BRAND}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="previous"
                name={d.dashboard8SeriesPrevious}
                fill={MUTED}
                radius={[4, 4, 0, 0]}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 lg:col-span-2">
            <span className="text-sm font-medium">
              {d.dashboard8DonutTitle}
            </span>
            <Chart type="pie" data={categoryData} height={200}>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={3}
                strokeWidth={0}
              >
                {CATEGORY_DATA.map((slice) => (
                  <Cell key={slice.labelKey} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip />
            </Chart>
            <div className="flex flex-col gap-2.5">
              {CATEGORY_DATA.map((slice) => (
                <div
                  key={slice.labelKey}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    {d[slice.labelKey]}
                  </span>
                  <span className="text-muted text-sm">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {d.dashboard8TopProductsTitle}
            </span>
            <button
              type="button"
              className="text-brand hover:text-brand-fg bg-brand/10 hover:bg-brand/15 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              {d.dashboard8ViewAll}
            </button>
          </div>
          <div ref={scrollFadeRef} className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="text-muted border-border grid grid-cols-[1.6fr_0.9fr_0.9fr] gap-4 border-b px-4 pb-2 text-xs font-medium">
                <span>{d.dashboard8TopProductsProduct}</span>
                <span>{d.dashboard8TopProductsSold}</span>
                <span className="text-right">
                  {d.dashboard8TopProductsRevenue}
                </span>
              </div>
              {PRODUCT_ROWS.map((row) => (
                <div
                  key={row.nameKey}
                  className="border-border grid grid-cols-[1.6fr_0.9fr_0.9fr] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="font-medium">{d[row.nameKey]}</span>
                  <span className="text-muted">{d[row.soldKey]}</span>
                  <span className="text-right font-medium">
                    {d[row.revenueKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
