"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconBox,
  IconLayoutDashboard,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconUsers,
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
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

const BRAND = "hsl(var(--brand))" as const;
const MUTED = "hsl(var(--muted))" as const;

type PageId = "overview" | "orders" | "customers";

type Trend = "up" | "down";

interface NavItemDatum {
  page: PageId | null;
  labelKey: string;
  icon: Icon;
}

interface NavGroupDatum {
  labelKey: string;
  items: NavItemDatum[];
}

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: Trend;
}

interface RevenueDatum {
  dayKey: string;
  revenue: number;
}

interface OrderDatum {
  idKey: string;
  nameKey: string;
  dateKey: string;
  totalKey: string;
  statusKey: string;
  seed: string;
}

interface CustomerDatum {
  nameKey: string;
  emailKey: string;
  planKey: string;
  planTone: "brand" | "neutral";
  seed: string;
}

const NAV_GROUPS: NavGroupDatum[] = [
  {
    labelKey: "dashboard10GroupGeneral",
    items: [
      {
        page: "overview",
        labelKey: "dashboard10NavOverview",
        icon: IconLayoutDashboard,
      },
      {
        page: "orders",
        labelKey: "dashboard10NavOrders",
        icon: IconShoppingCart,
      },
    ],
  },
  {
    labelKey: "dashboard10GroupManage",
    items: [
      {
        page: "customers",
        labelKey: "dashboard10NavCustomers",
        icon: IconUsers,
      },
      { page: null, labelKey: "dashboard10NavSettings", icon: IconSettings },
    ],
  },
];

const OVERVIEW_STATS: StatDatum[] = [
  {
    labelKey: "dashboard10Stat1Label",
    valueKey: "dashboard10Stat1Value",
    deltaKey: "dashboard10Stat1Delta",
    trend: "up",
  },
  {
    labelKey: "dashboard10Stat2Label",
    valueKey: "dashboard10Stat2Value",
    deltaKey: "dashboard10Stat2Delta",
    trend: "up",
  },
  {
    labelKey: "dashboard10Stat3Label",
    valueKey: "dashboard10Stat3Value",
    deltaKey: "dashboard10Stat3Delta",
    trend: "up",
  },
];

const REVENUE_DATA: RevenueDatum[] = [
  { dayKey: "dashboard10Day1", revenue: 6.2 },
  { dayKey: "dashboard10Day2", revenue: 7.4 },
  { dayKey: "dashboard10Day3", revenue: 6.8 },
  { dayKey: "dashboard10Day4", revenue: 8.1 },
  { dayKey: "dashboard10Day5", revenue: 9.3 },
  { dayKey: "dashboard10Day6", revenue: 7.9 },
  { dayKey: "dashboard10Day7", revenue: 8.6 },
];

const ORDER_ROWS: OrderDatum[] = [
  {
    idKey: "dashboard10Order1Id",
    nameKey: "dashboard10Order1Name",
    dateKey: "dashboard10Order1Date",
    totalKey: "dashboard10Order1Total",
    statusKey: "dashboard10StatusShipped",
    seed: "dash-10-order-1",
  },
  {
    idKey: "dashboard10Order2Id",
    nameKey: "dashboard10Order2Name",
    dateKey: "dashboard10Order2Date",
    totalKey: "dashboard10Order2Total",
    statusKey: "dashboard10StatusDelivered",
    seed: "dash-10-order-2",
  },
  {
    idKey: "dashboard10Order3Id",
    nameKey: "dashboard10Order3Name",
    dateKey: "dashboard10Order3Date",
    totalKey: "dashboard10Order3Total",
    statusKey: "dashboard10StatusProcessing",
    seed: "dash-10-order-3",
  },
  {
    idKey: "dashboard10Order4Id",
    nameKey: "dashboard10Order4Name",
    dateKey: "dashboard10Order4Date",
    totalKey: "dashboard10Order4Total",
    statusKey: "dashboard10StatusDelivered",
    seed: "dash-10-order-4",
  },
];

const STATUS_CLASSES: Record<string, string> = {
  dashboard10StatusShipped: "bg-warning/10 text-warning",
  dashboard10StatusDelivered: "bg-success/10 text-success",
  dashboard10StatusProcessing: "bg-info/10 text-info",
};

const CUSTOMER_ROWS: CustomerDatum[] = [
  {
    nameKey: "dashboard10Customer1Name",
    emailKey: "dashboard10Customer1Email",
    planKey: "dashboard10PlanPro",
    planTone: "brand",
    seed: "dash-10-cust-1",
  },
  {
    nameKey: "dashboard10Customer2Name",
    emailKey: "dashboard10Customer2Email",
    planKey: "dashboard10PlanGrowth",
    planTone: "neutral",
    seed: "dash-10-cust-2",
  },
  {
    nameKey: "dashboard10Customer3Name",
    emailKey: "dashboard10Customer3Email",
    planKey: "dashboard10PlanStarter",
    planTone: "neutral",
    seed: "dash-10-cust-3",
  },
  {
    nameKey: "dashboard10Customer4Name",
    emailKey: "dashboard10Customer4Email",
    planKey: "dashboard10PlanPro",
    planTone: "brand",
    seed: "dash-10-cust-4",
  },
  {
    nameKey: "dashboard10Customer5Name",
    emailKey: "dashboard10Customer5Email",
    planKey: "dashboard10PlanGrowth",
    planTone: "neutral",
    seed: "dash-10-cust-5",
  },
];

function resolveRevenue(d: Record<string, string>): Record<string, unknown>[] {
  return REVENUE_DATA.map((row) => ({
    day: d[row.dayKey],
    revenue: row.revenue,
  }));
}

function handlePageSwitch(
  page: PageId,
  setPage: Dispatch<SetStateAction<PageId>>,
) {
  setPage(page);
}

function TrendsRow({ d }: { d: Record<string, string> }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {OVERVIEW_STATS.map((stat) => (
        <div
          key={stat.labelKey}
          className="flex flex-col gap-4 rounded-2xl p-4"
        >
          <span className="text-muted text-sm">{d[stat.labelKey]}</span>
          <div className="flex items-end justify-between gap-3">
            <span className="text-2xl font-semibold tracking-tight">
              {d[stat.valueKey]}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                stat.trend === "up"
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error",
              )}
            >
              {d[stat.deltaKey]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewPage({ d }: { d: Record<string, string> }) {
  const revenueData = resolveRevenue(d);
  return (
    <div className="flex flex-col gap-4">
      <TrendsRow d={d} />
      <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
        <span className="text-sm font-medium">{d.dashboard10ChartTitle}</span>
        <Chart type="area" data={revenueData} height={260}>
          <defs>
            <linearGradient
              id="dashboard10RevenueFill"
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
            dataKey="day"
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
            name={d.dashboard10SeriesRevenue}
            stroke={BRAND}
            strokeWidth={2}
            fill="url(#dashboard10RevenueFill)"
          />
        </Chart>
      </div>
    </div>
  );
}

function OrdersPage({ d }: { d: Record<string, string> }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="text-muted border-border grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr] gap-4 border-b px-4 pb-2 text-xs font-medium">
            <span>{d.dashboard10OrdersOrder}</span>
            <span>{d.dashboard10OrdersCustomer}</span>
            <span>{d.dashboard10OrdersDate}</span>
            <span>{d.dashboard10OrdersTotal}</span>
            <span>{d.dashboard10OrdersStatus}</span>
          </div>
          {ORDER_ROWS.map((row) => (
            <div
              key={row.idKey}
              className="border-border grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <span className="text-muted">{d[row.idKey]}</span>
              <span className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  src={`https://picsum.photos/seed/${row.seed}/64/64`}
                  alt={d.dashboard10AvatarAlt}
                  fallback={d[row.nameKey]}
                />
                <span className="font-medium">{d[row.nameKey]}</span>
              </span>
              <span className="text-muted">{d[row.dateKey]}</span>
              <span className="font-medium">{d[row.totalKey]}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_CLASSES[row.statusKey] ??
                    STATUS_CLASSES.dashboard10StatusDelivered,
                )}
              >
                {d[row.statusKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomersPage({ d }: { d: Record<string, string> }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="text-muted border-border grid grid-cols-[1.4fr_0.8fr] gap-4 border-b px-4 pb-2 text-xs font-medium">
            <span>{d.dashboard10CustomersName}</span>
            <span>{d.dashboard10CustomersPlan}</span>
          </div>
          {CUSTOMER_ROWS.map((row) => (
            <div
              key={row.emailKey}
              className="border-border grid grid-cols-[1.4fr_0.8fr] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  src={`https://picsum.photos/seed/${row.seed}/64/64`}
                  alt={d.dashboard10AvatarAlt}
                  fallback={d[row.nameKey]}
                />
                <span className="flex flex-col">
                  <span className="font-medium">{d[row.nameKey]}</span>
                  <span className="text-muted text-xs">{d[row.emailKey]}</span>
                </span>
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                  row.planTone === "brand"
                    ? "bg-brand/10 text-brand"
                    : "bg-surface-hover text-muted",
                )}
              >
                {d[row.planKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MultiPageNavigationDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [page, setPage] = useState<PageId>("overview");
  const pageTitleKey = `dashboard10Page${page.charAt(0).toUpperCase()}${page.slice(1)}Title`;
  const pageDescriptionKey = `dashboard10Page${page.charAt(0).toUpperCase()}${page.slice(1)}Description`;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard10Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard10Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex h-[640px] w-full flex-col overflow-hidden rounded-2xl border shadow-xs lg:flex-row">
          <aside className="border-border flex w-full shrink-0 flex-col border-b lg:w-60 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-2 px-4 py-4">
              <span className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
                <IconBox
                  size={18}
                  className="text-brand-fg"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                {d.dashboard10Brand}
              </span>
            </div>
            <nav className="flex min-h-0 flex-1 gap-1 overflow-y-auto p-3">
              <div className="flex w-full flex-col gap-5">
                {NAV_GROUPS.map((group) => (
                  <div key={group.labelKey} className="flex flex-col gap-1">
                    <Typography variant="overline" className="px-2 pb-1">
                      {d[group.labelKey]}
                    </Typography>
                    {group.items.map((item) => {
                      const isActive = item.page === page;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.labelKey}
                          type="button"
                          onClick={
                            item.page
                              ? () =>
                                  handlePageSwitch(item.page as PageId, setPage)
                              : undefined
                          }
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "text-muted hover:bg-surface-hover flex h-9 w-full items-center gap-3 rounded-lg px-2 text-sm transition-colors",
                            isActive && "bg-surface-hover text-fg font-medium",
                          )}
                        >
                          <ItemIcon
                            size={18}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate text-left">
                            {d[item.labelKey]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </nav>
            <div className="border-border flex items-center gap-3 border-t p-3">
              <Avatar
                size="md"
                src="https://picsum.photos/seed/dash-10-user/64/64"
                alt={d.dashboard10AvatarAlt}
                fallback={d.dashboard10UserName}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">
                  {d.dashboard10UserName}
                </span>
                <span className="text-muted truncate text-xs">
                  {d.dashboard10UserEmail}
                </span>
              </div>
            </div>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="border-border bg-surface flex h-10 flex-1 items-center gap-2 rounded-xl border px-3">
                <IconSearch
                  size={16}
                  className="text-muted"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder={d.dashboard10SearchPlaceholder}
                  aria-label={d.dashboard10SearchAria}
                  className="text-fg placeholder:text-muted w-full bg-transparent text-sm outline-none"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={d.dashboard10NotificationsAria}
              >
                <IconBell size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={d.dashboard10ProfileAria}
              >
                <Avatar
                  size="sm"
                  src="https://picsum.photos/seed/dash-10-topuser/64/64"
                  alt={d.dashboard10AvatarAlt}
                  fallback={d.dashboard10UserName}
                />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Typography variant="h3">{d[pageTitleKey]}</Typography>
              <Typography variant="bodySmall" className="text-muted">
                {d[pageDescriptionKey]}
              </Typography>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {page === "overview" && <OverviewPage d={d} />}
              {page === "orders" && <OrdersPage d={d} />}
              {page === "customers" && <CustomersPage d={d} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
