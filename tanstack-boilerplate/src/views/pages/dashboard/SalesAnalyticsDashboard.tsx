"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCreditCard,
  IconShoppingCart,
  IconUserPlus,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Area,
  CartesianGrid,
  Chart,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Cell } from "recharts";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
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

interface TrendDatum {
  monthKey: string;
  sales: number;
  target: number;
}

interface MethodDatum {
  labelKey: string;
  value: number;
  color: string;
}

interface TransactionRow {
  nameKey: string;
  itemKey: string;
  methodKey: string;
  amountKey: string;
  statusKey: string;
  seed: string;
}

const STATS: StatDatum[] = [
  {
    labelKey: "dashboard9Stat1Label",
    valueKey: "dashboard9Stat1Value",
    deltaKey: "dashboard9Stat1Delta",
    trend: "up",
    icon: IconWallet,
  },
  {
    labelKey: "dashboard9Stat2Label",
    valueKey: "dashboard9Stat2Value",
    deltaKey: "dashboard9Stat2Delta",
    trend: "up",
    icon: IconShoppingCart,
  },
  {
    labelKey: "dashboard9Stat3Label",
    valueKey: "dashboard9Stat3Value",
    deltaKey: "dashboard9Stat3Delta",
    trend: "up",
    icon: IconUserPlus,
  },
  {
    labelKey: "dashboard9Stat4Label",
    valueKey: "dashboard9Stat4Value",
    deltaKey: "dashboard9Stat4Delta",
    trend: "down",
    icon: IconCreditCard,
  },
];

const TREND_DATA: TrendDatum[] = [
  { monthKey: "dashboard9Month1", sales: 44, target: 42 },
  { monthKey: "dashboard9Month2", sales: 49, target: 46 },
  { monthKey: "dashboard9Month3", sales: 53, target: 50 },
  { monthKey: "dashboard9Month4", sales: 58, target: 54 },
  { monthKey: "dashboard9Month5", sales: 62, target: 58 },
  { monthKey: "dashboard9Month6", sales: 59, target: 60 },
  { monthKey: "dashboard9Month7", sales: 68, target: 63 },
  { monthKey: "dashboard9Month8", sales: 73, target: 66 },
  { monthKey: "dashboard9Month9", sales: 70, target: 68 },
  { monthKey: "dashboard9Month10", sales: 78, target: 71 },
  { monthKey: "dashboard9Month11", sales: 84, target: 74 },
  { monthKey: "dashboard9Month12", sales: 90, target: 77 },
];

const METHOD_DATA: MethodDatum[] = [
  { labelKey: "dashboard9Pay1Label", value: 52, color: BRAND },
  { labelKey: "dashboard9Pay2Label", value: 27, color: INFO },
  { labelKey: "dashboard9Pay3Label", value: 14, color: SUCCESS },
  { labelKey: "dashboard9Pay4Label", value: 7, color: WARNING },
];

const TRANSACTION_ROWS: TransactionRow[] = [
  {
    nameKey: "dashboard9Row1Name",
    itemKey: "dashboard9Row1Item",
    methodKey: "dashboard9MethodCard",
    amountKey: "dashboard9Row1Amount",
    statusKey: "dashboard9Paid",
    seed: "dash-tx-1",
  },
  {
    nameKey: "dashboard9Row2Name",
    itemKey: "dashboard9Row2Item",
    methodKey: "dashboard9MethodPaypal",
    amountKey: "dashboard9Row2Amount",
    statusKey: "dashboard9Paid",
    seed: "dash-tx-2",
  },
  {
    nameKey: "dashboard9Row3Name",
    itemKey: "dashboard9Row3Item",
    methodKey: "dashboard9MethodTransfer",
    amountKey: "dashboard9Row3Amount",
    statusKey: "dashboard9Pending",
    seed: "dash-tx-3",
  },
  {
    nameKey: "dashboard9Row4Name",
    itemKey: "dashboard9Row4Item",
    methodKey: "dashboard9MethodCard",
    amountKey: "dashboard9Row4Amount",
    statusKey: "dashboard9Failed",
    seed: "dash-tx-4",
  },
  {
    nameKey: "dashboard9Row5Name",
    itemKey: "dashboard9Row5Item",
    methodKey: "dashboard9MethodWallet",
    amountKey: "dashboard9Row5Amount",
    statusKey: "dashboard9Paid",
    seed: "dash-tx-5",
  },
];

const STATUS_CLASSES: Record<string, string> = {
  dashboard9Paid: "bg-success/10 text-success",
  dashboard9Pending: "bg-warning/10 text-warning",
  dashboard9Failed: "bg-error/10 text-error",
};

function resolveTrend(d: Record<string, string>): Record<string, unknown>[] {
  return TREND_DATA.map((row) => ({
    month: d[row.monthKey],
    sales: row.sales,
    target: row.target,
  }));
}

function resolveMethods(d: Record<string, string>): Record<string, unknown>[] {
  return METHOD_DATA.map((row) => ({
    label: d[row.labelKey],
    value: row.value,
  }));
}

export function SalesAnalyticsDashboard() {
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const trendData = resolveTrend(d);
  const methodData = resolveMethods(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface flex max-w-6xl flex-col gap-6 rounded-2xl border p-6 shadow-xs lg:mx-auto lg:p-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard9Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="flex flex-col gap-4 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted text-sm">{d[stat.labelKey]}</span>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    stat.trend === "up"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error",
                  )}
                >
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
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {d.dashboard9ChartTitle}
              </span>
              <span className="text-muted text-xs">
                {d.dashboard9ChartPeriod}
              </span>
            </div>
            <Chart type="area" data={trendData} height={300}>
              <defs>
                <linearGradient
                  id="dashboard9SalesFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                name={d.dashboard9SeriesSales}
                stroke={BRAND}
                strokeWidth={2}
                fill="url(#dashboard9SalesFill)"
              />
              <Line
                type="monotone"
                dataKey="target"
                name={d.dashboard9SeriesTarget}
                stroke={INFO}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 lg:col-span-2">
            <span className="text-sm font-medium">
              {d.dashboard9DonutTitle}
            </span>
            <Chart type="pie" data={methodData} height={200}>
              <Pie
                data={methodData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={3}
                strokeWidth={0}
              >
                {METHOD_DATA.map((slice) => (
                  <Cell key={slice.labelKey} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip />
            </Chart>
            <div className="flex flex-col gap-2.5">
              {METHOD_DATA.map((slice) => (
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
              {d.dashboard9TableTitle}
            </span>
            <button
              type="button"
              className="text-brand hover:text-brand-fg bg-brand/10 hover:bg-brand/15 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              {d.dashboard9ViewAll}
            </button>
          </div>
          <div ref={scrollFadeRef} className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="text-muted border-border grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b px-4 pb-2 text-xs font-medium">
                <span>{d.dashboard9TableCustomer}</span>
                <span>{d.dashboard9TableItem}</span>
                <span>{d.dashboard9TableMethod}</span>
                <span>{d.dashboard9TableAmount}</span>
                <span>{d.dashboard9TableStatus}</span>
              </div>
              {TRANSACTION_ROWS.map((row) => (
                <div
                  key={row.nameKey}
                  className="border-border grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.8fr] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      src={placeholderImage(row.seed, "1x1")}
                      alt={d.dashboard9AvatarAlt}
                      fallback={d[row.nameKey]}
                    />
                    <span className="font-medium">{d[row.nameKey]}</span>
                  </span>
                  <span className="text-muted">{d[row.itemKey]}</span>
                  <span className="text-muted">{d[row.methodKey]}</span>
                  <span className="font-medium">{d[row.amountKey]}</span>
                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASSES[row.statusKey] ??
                        STATUS_CLASSES.dashboard9Paid,
                    )}
                  >
                    {d[row.statusKey]}
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
