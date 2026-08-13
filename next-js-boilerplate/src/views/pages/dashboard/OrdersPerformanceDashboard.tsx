"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconRefresh,
  IconShoppingCart,
  IconTrendingUp,
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
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

const BRAND = "hsl(var(--brand))" as const;
const MUTED = "hsl(var(--muted))" as const;
const INFO = "hsl(var(--info))" as const;

type Trend = "up" | "down";

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: Trend;
  icon: Icon;
}

interface PerformanceDatum {
  monthKey: string;
  revenue: number;
  orders: number;
}

interface OrderRow {
  nameKey: string;
  orderKey: string;
  dateKey: string;
  statusKey: string;
  totalKey: string;
  seed: string;
}

interface StatusDatum {
  labelKey: string;
  className: string;
}

const STATS: StatDatum[] = [
  {
    labelKey: "dashboard7Stat1Label",
    valueKey: "dashboard7Stat1Value",
    deltaKey: "dashboard7Stat1Delta",
    trend: "up",
    icon: IconShoppingCart,
  },
  {
    labelKey: "dashboard7Stat2Label",
    valueKey: "dashboard7Stat2Value",
    deltaKey: "dashboard7Stat2Delta",
    trend: "up",
    icon: IconWallet,
  },
  {
    labelKey: "dashboard7Stat3Label",
    valueKey: "dashboard7Stat3Value",
    deltaKey: "dashboard7Stat3Delta",
    trend: "up",
    icon: IconTrendingUp,
  },
  {
    labelKey: "dashboard7Stat4Label",
    valueKey: "dashboard7Stat4Value",
    deltaKey: "dashboard7Stat4Delta",
    trend: "down",
    icon: IconRefresh,
  },
];

const PERFORMANCE_DATA: PerformanceDatum[] = [
  { monthKey: "dashboard7Month1", revenue: 42, orders: 240 },
  { monthKey: "dashboard7Month2", revenue: 38, orders: 210 },
  { monthKey: "dashboard7Month3", revenue: 51, orders: 290 },
  { monthKey: "dashboard7Month4", revenue: 48, orders: 270 },
  { monthKey: "dashboard7Month5", revenue: 61, orders: 340 },
  { monthKey: "dashboard7Month6", revenue: 57, orders: 320 },
  { monthKey: "dashboard7Month7", revenue: 69, orders: 380 },
  { monthKey: "dashboard7Month8", revenue: 74, orders: 410 },
  { monthKey: "dashboard7Month9", revenue: 66, orders: 370 },
  { monthKey: "dashboard7Month10", revenue: 79, orders: 440 },
  { monthKey: "dashboard7Month11", revenue: 85, orders: 470 },
  { monthKey: "dashboard7Month12", revenue: 92, orders: 510 },
];

const ORDER_ROWS: OrderRow[] = [
  {
    nameKey: "dashboard7Row1Name",
    orderKey: "dashboard7Row1Order",
    dateKey: "dashboard7Row1Date",
    statusKey: "dashboard7StatusShipped",
    totalKey: "dashboard7Row1Total",
    seed: "dash-order-1",
  },
  {
    nameKey: "dashboard7Row2Name",
    orderKey: "dashboard7Row2Order",
    dateKey: "dashboard7Row2Date",
    statusKey: "dashboard7StatusProcessing",
    totalKey: "dashboard7Row2Total",
    seed: "dash-order-2",
  },
  {
    nameKey: "dashboard7Row3Name",
    orderKey: "dashboard7Row3Order",
    dateKey: "dashboard7Row3Date",
    statusKey: "dashboard7StatusDelivered",
    totalKey: "dashboard7Row3Total",
    seed: "dash-order-3",
  },
  {
    nameKey: "dashboard7Row4Name",
    orderKey: "dashboard7Row4Order",
    dateKey: "dashboard7Row4Date",
    statusKey: "dashboard7StatusCancelled",
    totalKey: "dashboard7Row4Total",
    seed: "dash-order-4",
  },
  {
    nameKey: "dashboard7Row5Name",
    orderKey: "dashboard7Row5Order",
    dateKey: "dashboard7Row5Date",
    statusKey: "dashboard7StatusDelivered",
    totalKey: "dashboard7Row5Total",
    seed: "dash-order-5",
  },
];

const STATUS_CLASSES: Record<string, string> = {
  dashboard7StatusDelivered: "bg-success/10 text-success",
  dashboard7StatusProcessing: "bg-info/10 text-info",
  dashboard7StatusShipped: "bg-warning/10 text-warning",
  dashboard7StatusCancelled: "bg-error/10 text-error",
};

const statusTone = (statusKey: string): StatusDatum => ({
  labelKey: statusKey,
  className:
    STATUS_CLASSES[statusKey] ?? STATUS_CLASSES.dashboard7StatusDelivered,
});

function resolvePerformance(
  d: Record<string, string>,
): Record<string, unknown>[] {
  return PERFORMANCE_DATA.map((row) => ({
    month: d[row.monthKey],
    revenue: row.revenue,
    orders: row.orders,
  }));
}

export function OrdersPerformanceDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const performanceData = resolvePerformance(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface flex max-w-6xl flex-col gap-6 rounded-2xl border p-6 shadow-xs lg:mx-auto lg:p-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard7Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard7Description}
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
        <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {d.dashboard7ChartTitle}
            </span>
            <span className="text-muted text-xs">
              {d.dashboard7ChartPeriod}
            </span>
          </div>
          <Chart type="area" data={performanceData} height={300}>
            <defs>
              <linearGradient
                id="dashboard7RevenueFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient
                id="dashboard7OrdersFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={INFO} stopOpacity={0.3} />
                <stop offset="100%" stopColor={INFO} stopOpacity={0.02} />
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
              dataKey="revenue"
              name={d.dashboard7SeriesRevenue}
              stroke={BRAND}
              strokeWidth={2}
              fill="url(#dashboard7RevenueFill)"
            />
            <Area
              type="monotone"
              dataKey="orders"
              name={d.dashboard7SeriesOrders}
              stroke={INFO}
              strokeWidth={2}
              fill="url(#dashboard7OrdersFill)"
            />
          </Chart>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {d.dashboard7TableTitle}
            </span>
            <button
              type="button"
              className="text-brand hover:text-brand-fg bg-brand/10 hover:bg-brand/15 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              {d.dashboard7TableViewAll}
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="text-muted border-border grid grid-cols-[1.4fr_1fr_1fr_0.9fr_1fr] gap-4 border-b px-4 pb-2 text-xs font-medium">
                <span>{d.dashboard7TableCustomer}</span>
                <span>{d.dashboard7TableOrder}</span>
                <span>{d.dashboard7TableDate}</span>
                <span>{d.dashboard7TableStatus}</span>
                <span className="text-right">{d.dashboard7TableTotal}</span>
              </div>
              {ORDER_ROWS.map((row) => {
                const status = statusTone(row.statusKey);
                return (
                  <div
                    key={row.orderKey}
                    className="border-border grid grid-cols-[1.4fr_1fr_1fr_0.9fr_1fr] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        src={`https://picsum.photos/seed/${row.seed}/64/64`}
                        alt={d.dashboard7AvatarAlt}
                        fallback={d[row.nameKey]}
                      />
                      <span className="font-medium">{d[row.nameKey]}</span>
                    </span>
                    <span className="text-muted">{d[row.orderKey]}</span>
                    <span className="text-muted">{d[row.dateKey]}</span>
                    <span
                      className={cn(
                        "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                        status.className,
                      )}
                    >
                      {d[status.labelKey]}
                    </span>
                    <span className="text-right font-medium">
                      {d[row.totalKey]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
