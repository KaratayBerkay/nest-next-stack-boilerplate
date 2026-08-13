"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBrandApple,
  IconBrandPaypal,
  IconBrandVisa,
  IconCircleCheck,
  IconDownload,
  IconReceipt,
  IconTag,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

const BRAND = "hsl(var(--brand))" as const;
const INFO = "hsl(var(--info))" as const;
const MUTED = "hsl(var(--muted))" as const;

type Filter = "all" | "completed" | "pending" | "failed";

interface MonthlyPoint {
  monthKey: string;
  gross: number;
  net: number;
}

interface MappedMonthlyPoint extends Record<string, unknown> {
  month: string;
  gross: number;
  net: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface FilterOption {
  value: Filter;
  labelKey: string;
}

interface TransactionRow {
  customerKey: string;
  dateKey: string;
  methodKey: string;
  amountKey: string;
  statusKey: string;
}

const FILTERS: FilterOption[] = [
  { value: "all", labelKey: "dashboard5FilterAll" },
  { value: "completed", labelKey: "dashboard5FilterCompleted" },
  { value: "pending", labelKey: "dashboard5FilterPending" },
  { value: "failed", labelKey: "dashboard5FilterFailed" },
];

const STATUS_KEY_BY_FILTER: Record<Exclude<Filter, "all">, string> = {
  completed: "dashboard5StatusCompleted",
  pending: "dashboard5StatusPending",
  failed: "dashboard5StatusFailed",
};

const MONTHLY_DATA: MonthlyPoint[] = [
  { monthKey: "dashboard5Month1", gross: 16800, net: 13800 },
  { monthKey: "dashboard5Month2", gross: 18900, net: 15400 },
  { monthKey: "dashboard5Month3", gross: 17600, net: 14300 },
  { monthKey: "dashboard5Month4", gross: 21400, net: 17600 },
  { monthKey: "dashboard5Month5", gross: 19800, net: 16200 },
  { monthKey: "dashboard5Month6", gross: 23600, net: 19400 },
  { monthKey: "dashboard5Month7", gross: 22400, net: 18600 },
  { monthKey: "dashboard5Month8", gross: 25800, net: 21200 },
  { monthKey: "dashboard5Month9", gross: 24100, net: 19800 },
  { monthKey: "dashboard5Month10", gross: 27600, net: 22900 },
  { monthKey: "dashboard5Month11", gross: 29400, net: 24500 },
  { monthKey: "dashboard5Month12", gross: 32800, net: 27600 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconWallet,
    trend: "up",
    labelKey: "dashboard5Stat1Label",
    valueKey: "dashboard5Stat1Value",
    deltaKey: "dashboard5Stat1Delta",
  },
  {
    icon: IconReceipt,
    trend: "up",
    labelKey: "dashboard5Stat2Label",
    valueKey: "dashboard5Stat2Value",
    deltaKey: "dashboard5Stat2Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "down",
    labelKey: "dashboard5Stat3Label",
    valueKey: "dashboard5Stat3Value",
    deltaKey: "dashboard5Stat3Delta",
  },
  {
    icon: IconTag,
    trend: "down",
    labelKey: "dashboard5Stat4Label",
    valueKey: "dashboard5Stat4Value",
    deltaKey: "dashboard5Stat4Delta",
  },
];

const TRANSACTIONS: TransactionRow[] = [
  {
    customerKey: "dashboard5Customer1",
    dateKey: "dashboard5Date1",
    methodKey: "dashboard5MethodVisa",
    amountKey: "dashboard5Amount1",
    statusKey: "dashboard5StatusCompleted",
  },
  {
    customerKey: "dashboard5Customer2",
    dateKey: "dashboard5Date2",
    methodKey: "dashboard5MethodPaypal",
    amountKey: "dashboard5Amount2",
    statusKey: "dashboard5StatusPending",
  },
  {
    customerKey: "dashboard5Customer3",
    dateKey: "dashboard5Date3",
    methodKey: "dashboard5MethodApplePay",
    amountKey: "dashboard5Amount3",
    statusKey: "dashboard5StatusCompleted",
  },
  {
    customerKey: "dashboard5Customer4",
    dateKey: "dashboard5Date4",
    methodKey: "dashboard5MethodVisa",
    amountKey: "dashboard5Amount4",
    statusKey: "dashboard5StatusFailed",
  },
  {
    customerKey: "dashboard5Customer5",
    dateKey: "dashboard5Date5",
    methodKey: "dashboard5MethodPaypal",
    amountKey: "dashboard5Amount5",
    statusKey: "dashboard5StatusPending",
  },
];

const METHOD_ICONS: Record<string, Icon> = {
  dashboard5MethodVisa: IconBrandVisa,
  dashboard5MethodPaypal: IconBrandPaypal,
  dashboard5MethodApplePay: IconBrandApple,
};

const STATUS_TONES: Record<string, "success" | "warning" | "error"> = {
  dashboard5StatusCompleted: "success",
  dashboard5StatusPending: "warning",
  dashboard5StatusFailed: "error",
};

function getChartData(d: DashboardMessages): MappedMonthlyPoint[] {
  return MONTHLY_DATA.map((point) => ({
    month: d[point.monthKey],
    gross: point.gross,
    net: point.net,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function getStatusTone(statusKey: string) {
  return STATUS_TONES[statusKey] ?? "secondary";
}

function filterTransactions(rows: TransactionRow[], filter: Filter) {
  if (filter === "all") return rows;
  const statusKey = STATUS_KEY_BY_FILTER[filter];
  return rows.filter((row) => row.statusKey === statusKey);
}

function handleFilterSelect(
  filter: Filter,
  setFilter: Dispatch<SetStateAction<Filter>>,
) {
  setFilter(filter);
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

function TransactionsTable({
  rows,
  d,
}: {
  rows: TransactionRow[];
  d: DashboardMessages;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{d.dashboard5ColumnCustomer}</TableHead>
          <TableHead>{d.dashboard5ColumnDate}</TableHead>
          <TableHead>{d.dashboard5ColumnMethod}</TableHead>
          <TableHead className="text-right">
            {d.dashboard5ColumnAmount}
          </TableHead>
          <TableHead className="text-right">
            {d.dashboard5ColumnStatus}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const MethodIcon = METHOD_ICONS[row.methodKey] ?? IconCircleCheck;
          return (
            <TableRow key={row.customerKey}>
              <TableCell>
                <span className="font-medium">{d[row.customerKey]}</span>
              </TableCell>
              <TableCell className="text-muted">{d[row.dateKey]}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <MethodIcon
                    size={16}
                    className="text-muted"
                    aria-hidden="true"
                  />
                  <span className="text-muted">{d[row.methodKey]}</span>
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {d[row.amountKey]}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusTone(row.statusKey)} size="sm" pill>
                  {d[row.statusKey]}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function EcommerceTransactionsDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [filter, setFilter] = useState<Filter>("all");
  const chartData = getChartData(d) as unknown as Record<string, unknown>[];
  const visibleRows = filterTransactions(TRANSACTIONS, filter);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard5Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard5ChartTitle}</Typography>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 !rounded-full"
            >
              <IconDownload size={14} aria-hidden="true" />
              {d.dashboard5ExportLabel}
            </Button>
          </div>
          <Chart type="line" data={chartData} height={280}>
            <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="gross"
              name={d.dashboard5SeriesGross}
              stroke={BRAND}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="net"
              name={d.dashboard5SeriesNet}
              stroke={INFO}
              strokeWidth={2}
            />
          </Chart>
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard5TableTitle}</Typography>
            <div className="flex gap-1">
              {FILTERS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filter === option.value ? "default" : "outline"}
                  className="!rounded-full"
                  onClick={() => handleFilterSelect(option.value, setFilter)}
                >
                  {d[option.labelKey]}
                </Button>
              ))}
            </div>
          </div>
          <TransactionsTable d={d} rows={visibleRows} />
        </div>
      </div>
    </section>
  );
}
