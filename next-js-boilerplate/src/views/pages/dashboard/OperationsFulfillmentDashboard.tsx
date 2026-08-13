"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBox,
  IconCircleCheck,
  IconClock,
  IconPackage,
  IconTruck,
  IconTruckDelivery,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Bar,
  CartesianGrid,
  Chart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
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
const WARNING = "hsl(var(--warning))" as const;
const MUTED = "hsl(var(--muted))" as const;

type Filter = "all" | "pending" | "inTransit";

interface ShippingPoint {
  dayKey: string;
  shipped: number;
  returned: number;
}

interface MappedShippingPoint extends Record<string, unknown> {
  day: string;
  shipped: number;
  returned: number;
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

interface FulfillmentRow {
  orderKey: string;
  itemKey: string;
  etaKey: string;
  statusKey: string;
  progress: number;
}

const FILTERS: FilterOption[] = [
  { value: "all", labelKey: "dashboard6FilterAll" },
  { value: "pending", labelKey: "dashboard6FilterPending" },
  { value: "inTransit", labelKey: "dashboard6FilterInTransit" },
];

const STATUS_KEY_BY_FILTER: Record<Exclude<Filter, "all">, string> = {
  pending: "dashboard6StatusPending",
  inTransit: "dashboard6StatusInTransit",
};

const SHIPPING_DATA: ShippingPoint[] = [
  { dayKey: "dashboard6Day1", shipped: 148, returned: 12 },
  { dayKey: "dashboard6Day2", shipped: 186, returned: 9 },
  { dayKey: "dashboard6Day3", shipped: 172, returned: 14 },
  { dayKey: "dashboard6Day4", shipped: 214, returned: 11 },
  { dayKey: "dashboard6Day5", shipped: 198, returned: 13 },
  { dayKey: "dashboard6Day6", shipped: 162, returned: 8 },
  { dayKey: "dashboard6Day7", shipped: 236, returned: 15 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconPackage,
    trend: "up",
    labelKey: "dashboard6Stat1Label",
    valueKey: "dashboard6Stat1Value",
    deltaKey: "dashboard6Stat1Delta",
  },
  {
    icon: IconTruck,
    trend: "up",
    labelKey: "dashboard6Stat2Label",
    valueKey: "dashboard6Stat2Value",
    deltaKey: "dashboard6Stat2Delta",
  },
  {
    icon: IconTruckDelivery,
    trend: "up",
    labelKey: "dashboard6Stat3Label",
    valueKey: "dashboard6Stat3Value",
    deltaKey: "dashboard6Stat3Delta",
  },
  {
    icon: IconCircleCheck,
    trend: "down",
    labelKey: "dashboard6Stat4Label",
    valueKey: "dashboard6Stat4Value",
    deltaKey: "dashboard6Stat4Delta",
  },
];

const FULFILLMENT_ROWS: FulfillmentRow[] = [
  {
    orderKey: "dashboard6Order1",
    itemKey: "dashboard6Item1",
    etaKey: "dashboard6Eta1",
    statusKey: "dashboard6StatusInTransit",
    progress: 72,
  },
  {
    orderKey: "dashboard6Order2",
    itemKey: "dashboard6Item2",
    etaKey: "dashboard6Eta2",
    statusKey: "dashboard6StatusPending",
    progress: 34,
  },
  {
    orderKey: "dashboard6Order3",
    itemKey: "dashboard6Item3",
    etaKey: "dashboard6Eta3",
    statusKey: "dashboard6StatusInTransit",
    progress: 85,
  },
  {
    orderKey: "dashboard6Order4",
    itemKey: "dashboard6Item4",
    etaKey: "dashboard6Eta4",
    statusKey: "dashboard6StatusPending",
    progress: 18,
  },
  {
    orderKey: "dashboard6Order5",
    itemKey: "dashboard6Item5",
    etaKey: "dashboard6Eta5",
    statusKey: "dashboard6StatusDelivered",
    progress: 100,
  },
];

const STATUS_ICONS: Record<string, Icon> = {
  dashboard6StatusPending: IconClock,
  dashboard6StatusInTransit: IconTruck,
  dashboard6StatusDelivered: IconCircleCheck,
};

const STATUS_TONES: Record<string, string> = {
  dashboard6StatusPending: "bg-warning/10 text-warning",
  dashboard6StatusInTransit: "bg-info/10 text-info",
  dashboard6StatusDelivered: "bg-success/10 text-success",
};

function getChartData(d: DashboardMessages): MappedShippingPoint[] {
  return SHIPPING_DATA.map((point) => ({
    day: d[point.dayKey],
    shipped: point.shipped,
    returned: point.returned,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function getStatusTone(statusKey: string) {
  return STATUS_TONES[statusKey] ?? "bg-muted/15 text-muted";
}

function filterRows(rows: FulfillmentRow[], filter: Filter) {
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

function StatusPill({
  statusKey,
  d,
}: {
  statusKey: string;
  d: DashboardMessages;
}) {
  const StatusIcon = STATUS_ICONS[statusKey] ?? IconBox;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        getStatusTone(statusKey),
      )}
    >
      <StatusIcon size={14} aria-hidden="true" />
      {d[statusKey]}
    </span>
  );
}

export function OperationsFulfillmentDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [filter, setFilter] = useState<Filter>("all");
  const shippingData = getChartData(d) as unknown as Record<string, unknown>[];
  const visibleRows = filterRows(FULFILLMENT_ROWS, filter);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {d.dashboard6Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {d.dashboard6Description}
            </Typography>
          </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <Typography variant="h5">{d.dashboard6ChartTitle}</Typography>
          <Chart type="bar" data={shippingData} height={260}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={MUTED}
              vertical={false}
            />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="shipped"
              name={d.dashboard6SeriesShipped}
              fill={BRAND}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="returned"
              name={d.dashboard6SeriesReturned}
              fill={WARNING}
              radius={[4, 4, 0, 0]}
            />
          </Chart>
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <Typography variant="h5">{d.dashboard6TableTitle}</Typography>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dashboard6ColumnOrder}</TableHead>
                <TableHead>{d.dashboard6ColumnItem}</TableHead>
                <TableHead>{d.dashboard6ColumnStatus}</TableHead>
                <TableHead>{d.dashboard6ColumnProgress}</TableHead>
                <TableHead className="text-right">
                  {d.dashboard6ColumnEta}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.orderKey}>
                  <TableCell className="font-medium tabular-nums">
                    {d[row.orderKey]}
                  </TableCell>
                  <TableCell>{d[row.itemKey]}</TableCell>
                  <TableCell>
                    <StatusPill statusKey={row.statusKey} d={d} />
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Progress value={row.progress} size="sm" />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted text-right tabular-nums">
                    {d[row.etaKey]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
