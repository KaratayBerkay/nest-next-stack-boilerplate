"use client";

import {
  IconActivity,
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconClock,
  IconGauge,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Area,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Avatar } from "@/components/ui/Avatar";
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
const MUTED = "hsl(var(--muted))" as const;

interface SessionPoint {
  hourKey: string;
  value: number;
}

interface MappedSessionPoint extends Record<string, unknown> {
  hour: string;
  value: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface SessionRow {
  nameKey: string;
  regionKey: string;
  timeKey: string;
  latencyKey: string;
  seed: string;
}

const SESSION_POINTS: SessionPoint[] = [
  { hourKey: "dashboard13Hour1", value: 320 },
  { hourKey: "dashboard13Hour2", value: 410 },
  { hourKey: "dashboard13Hour3", value: 380 },
  { hourKey: "dashboard13Hour4", value: 520 },
  { hourKey: "dashboard13Hour5", value: 610 },
  { hourKey: "dashboard13Hour6", value: 560 },
  { hourKey: "dashboard13Hour7", value: 720 },
  { hourKey: "dashboard13Hour8", value: 830 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconUsers,
    trend: "up",
    labelKey: "dashboard13Stat1Label",
    valueKey: "dashboard13Stat1Value",
    deltaKey: "dashboard13Stat1Delta",
  },
  {
    icon: IconClock,
    trend: "down",
    labelKey: "dashboard13Stat2Label",
    valueKey: "dashboard13Stat2Value",
    deltaKey: "dashboard13Stat2Delta",
  },
  {
    icon: IconGauge,
    trend: "up",
    labelKey: "dashboard13Stat3Label",
    valueKey: "dashboard13Stat3Value",
    deltaKey: "dashboard13Stat3Delta",
  },
  {
    icon: IconAlertTriangle,
    trend: "down",
    labelKey: "dashboard13Stat4Label",
    valueKey: "dashboard13Stat4Value",
    deltaKey: "dashboard13Stat4Delta",
  },
];

const SESSION_ROWS: SessionRow[] = [
  {
    nameKey: "dashboard13Row1Name",
    regionKey: "dashboard13Row1Region",
    timeKey: "dashboard13Row1Time",
    latencyKey: "dashboard13Row1Latency",
    seed: "dash-13-1",
  },
  {
    nameKey: "dashboard13Row2Name",
    regionKey: "dashboard13Row2Region",
    timeKey: "dashboard13Row2Time",
    latencyKey: "dashboard13Row2Latency",
    seed: "dash-13-2",
  },
  {
    nameKey: "dashboard13Row3Name",
    regionKey: "dashboard13Row3Region",
    timeKey: "dashboard13Row3Time",
    latencyKey: "dashboard13Row3Latency",
    seed: "dash-13-3",
  },
  {
    nameKey: "dashboard13Row4Name",
    regionKey: "dashboard13Row4Region",
    timeKey: "dashboard13Row4Time",
    latencyKey: "dashboard13Row4Latency",
    seed: "dash-13-4",
  },
  {
    nameKey: "dashboard13Row5Name",
    regionKey: "dashboard13Row5Region",
    timeKey: "dashboard13Row5Time",
    latencyKey: "dashboard13Row5Latency",
    seed: "dash-13-5",
  },
];

function getChartData(d: DashboardMessages): MappedSessionPoint[] {
  return SESSION_POINTS.map((point) => ({
    hour: d[point.hourKey],
    value: point.value,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
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

function LiveBadge({ d }: { d: DashboardMessages }) {
  return (
    <span className="bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
      <span className="relative flex size-2">
        <span
          className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          aria-hidden="true"
        />
        <span className="bg-success relative inline-flex size-2 rounded-full" />
      </span>
      {d.dashboard13Live}
    </span>
  );
}

export function RealtimeSessionsDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const sessionData = getChartData(d) as unknown as Record<string, unknown>[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {d.dashboard13Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {d.dashboard13Description}
            </Typography>
          </div>
          <LiveBadge d={d} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard13ChartTitle}</Typography>
            <span className="text-muted text-sm">
              {d.dashboard13ChartPeriod}
            </span>
          </div>
          <Chart type="area" data={sessionData} height={280}>
            <defs>
              <linearGradient
                id="dashboard13SessionsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={MUTED}
              vertical={false}
            />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              name={d.dashboard13SeriesSessions}
              stroke={BRAND}
              fill="url(#dashboard13SessionsGradient)"
            />
          </Chart>
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard13TableTitle}</Typography>
            <IconActivity size={18} className="text-muted" aria-hidden="true" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dashboard13TableVisitor}</TableHead>
                <TableHead>{d.dashboard13TableRegion}</TableHead>
                <TableHead>{d.dashboard13TableStarted}</TableHead>
                <TableHead className="text-right">
                  {d.dashboard13TableLatency}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SESSION_ROWS.map((row) => (
                <TableRow key={row.nameKey}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        src={`https://picsum.photos/seed/${row.seed}/64/64`}
                        alt={d.dashboard13AvatarAlt}
                        fallback={d[row.nameKey]}
                      />
                      <span className="font-medium">{d[row.nameKey]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted inline-flex items-center gap-1.5">
                      <IconWorld size={14} aria-hidden="true" />
                      {d[row.regionKey]}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted tabular-nums">
                    {d[row.timeKey]}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {d[row.latencyKey]}
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
