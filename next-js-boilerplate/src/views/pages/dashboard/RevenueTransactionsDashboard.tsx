"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowDownRight,
  IconArrowRight,
  IconArrowUpRight,
  IconRefresh,
  IconShoppingCart,
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
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

const LINK_URL = "#" as const;

const BRAND = "hsl(var(--brand))" as const;
const MUTED = "hsl(var(--muted))" as const;

interface MonthlyPoint {
  monthKey: string;
  revenue: number;
}

interface MappedMonthlyPoint extends Record<string, unknown> {
  month: string;
  revenue: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface TransactionRow {
  customerKey: string;
  dateKey: string;
  amountKey: string;
  statusKey: string;
  seed: string;
}

const MONTHLY_DATA: MonthlyPoint[] = [
  { monthKey: "dashboard2Month1", revenue: 4200 },
  { monthKey: "dashboard2Month2", revenue: 6100 },
  { monthKey: "dashboard2Month3", revenue: 5400 },
  { monthKey: "dashboard2Month4", revenue: 7200 },
  { monthKey: "dashboard2Month5", revenue: 6800 },
  { monthKey: "dashboard2Month6", revenue: 8400 },
  { monthKey: "dashboard2Month7", revenue: 7900 },
  { monthKey: "dashboard2Month8", revenue: 9500 },
  { monthKey: "dashboard2Month9", revenue: 9100 },
  { monthKey: "dashboard2Month10", revenue: 10800 },
  { monthKey: "dashboard2Month11", revenue: 11400 },
  { monthKey: "dashboard2Month12", revenue: 12600 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconWallet,
    trend: "up",
    labelKey: "dashboard2Stat1Label",
    valueKey: "dashboard2Stat1Value",
    deltaKey: "dashboard2Stat1Delta",
  },
  {
    icon: IconShoppingCart,
    trend: "up",
    labelKey: "dashboard2Stat2Label",
    valueKey: "dashboard2Stat2Value",
    deltaKey: "dashboard2Stat2Delta",
  },
  {
    icon: IconRefresh,
    trend: "down",
    labelKey: "dashboard2Stat3Label",
    valueKey: "dashboard2Stat3Value",
    deltaKey: "dashboard2Stat3Delta",
  },
  {
    icon: IconUsers,
    trend: "up",
    labelKey: "dashboard2Stat4Label",
    valueKey: "dashboard2Stat4Value",
    deltaKey: "dashboard2Stat4Delta",
  },
];

const TRANSACTIONS: TransactionRow[] = [
  {
    customerKey: "dashboard2Customer1",
    dateKey: "dashboard2Date1",
    amountKey: "dashboard2Amount1",
    statusKey: "dashboard2StatusPaid",
    seed: "amelia-rhodes",
  },
  {
    customerKey: "dashboard2Customer2",
    dateKey: "dashboard2Date2",
    amountKey: "dashboard2Amount2",
    statusKey: "dashboard2StatusPending",
    seed: "jonas-weber",
  },
  {
    customerKey: "dashboard2Customer3",
    dateKey: "dashboard2Date3",
    amountKey: "dashboard2Amount3",
    statusKey: "dashboard2StatusPaid",
    seed: "priya-sharma",
  },
  {
    customerKey: "dashboard2Customer4",
    dateKey: "dashboard2Date4",
    amountKey: "dashboard2Amount4",
    statusKey: "dashboard2StatusFailed",
    seed: "lucas-moreau",
  },
  {
    customerKey: "dashboard2Customer5",
    dateKey: "dashboard2Date5",
    amountKey: "dashboard2Amount5",
    statusKey: "dashboard2StatusPaid",
    seed: "sofia-ricci",
  },
];

const STATUS_TONES: Record<string, "success" | "warning" | "error"> = {
  dashboard2StatusPaid: "success",
  dashboard2StatusPending: "warning",
  dashboard2StatusFailed: "error",
};

function getChartData(d: DashboardMessages): MappedMonthlyPoint[] {
  return MONTHLY_DATA.map((item) => ({
    month: d[item.monthKey],
    revenue: item.revenue,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function handleTabChange(
  value: string,
  setActiveTab: Dispatch<SetStateAction<string>>,
) {
  setActiveTab(value);
}

function getStatusTone(statusKey: string) {
  return STATUS_TONES[statusKey] ?? "secondary";
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

function TransactionsTable({ d }: { d: DashboardMessages }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="h5">{d.dashboard2TableTitle}</Typography>
        <a
          href={LINK_URL}
          className="text-brand inline-flex items-center gap-1 text-sm font-medium"
        >
          {d.dashboard2TableAction}
          <IconArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{d.dashboard2ColumnCustomer}</TableHead>
            <TableHead>{d.dashboard2ColumnDate}</TableHead>
            <TableHead className="text-right">
              {d.dashboard2ColumnAmount}
            </TableHead>
            <TableHead className="text-right">
              {d.dashboard2ColumnStatus}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TRANSACTIONS.map((row) => (
            <TableRow key={row.customerKey}>
              <TableCell>
                <span className="flex items-center gap-3">
                  <Avatar
                    src={`https://picsum.photos/seed/${row.seed}/64/64`}
                    alt={d[row.customerKey]}
                    fallback={d[row.customerKey].charAt(0)}
                    size="sm"
                  />
                  <span className="font-medium">{d[row.customerKey]}</span>
                </span>
              </TableCell>
              <TableCell className="text-muted">{d[row.dateKey]}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {d[row.amountKey]}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusTone(row.statusKey)} size="sm" pill>
                  {d[row.statusKey]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RevenueTransactionsDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [activeTab, setActiveTab] = useState<string>("overview");
  const chartData = getChartData(d) as unknown as Record<string, unknown>[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard2Description}
          </Typography>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => handleTabChange(value, setActiveTab)}
        >
          <TabsList>
            <TabsTrigger value="overview">
              {d.dashboard2TabOverview}
            </TabsTrigger>
            <TabsTrigger value="transactions">
              {d.dashboard2TabTransactions}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                  <StatCard key={stat.labelKey} stat={stat} d={d} />
                ))}
              </div>
              <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
                <Typography variant="h5">{d.dashboard2ChartTitle}</Typography>
                <Chart type="area" data={chartData} height={280}>
                  <defs>
                    <linearGradient
                      id="dashboard2RevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={d.dashboard2ChartSeries}
                    stroke={BRAND}
                    fill="url(#dashboard2RevenueGradient)"
                  />
                </Chart>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="mt-6">
            <div className="border-border bg-surface rounded-2xl border p-6">
              <TransactionsTable d={d} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
