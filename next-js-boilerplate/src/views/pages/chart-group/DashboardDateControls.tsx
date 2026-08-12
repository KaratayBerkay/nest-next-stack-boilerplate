"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Cell } from "recharts";
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
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

type ChartGroupMessages = PagesWithChartGroupMessages["chartGroup"];
type DateRange = "7d" | "30d" | "90d";

interface RevenuePoint {
  labelKey: string;
  revenue: number;
  expenses: number;
}

interface MappedRevenuePoint extends Record<string, unknown> {
  label: string;
  revenue: number;
  expenses: number;
}

interface UserPoint {
  labelKey: string;
  users: number;
  sessions: number;
}

interface MappedUserPoint extends Record<string, unknown> {
  label: string;
  users: number;
  sessions: number;
}

interface WeeklyPoint {
  labelKey: string;
  current: number;
  previous: number;
}

interface MappedWeeklyPoint extends Record<string, unknown> {
  label: string;
  current: number;
  previous: number;
}

interface ChannelPoint {
  nameKey: string;
  value: number;
  color: string;
}

interface MappedChannelPoint extends Record<string, unknown> {
  name: string;
  value: number;
}

interface RangeOption {
  value: DateRange;
  labelKey: string;
}

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

const RANGE_OPTIONS: RangeOption[] = [
  { value: "7d", labelKey: "chartGroup12Range7d" },
  { value: "30d", labelKey: "chartGroup12Range30d" },
  { value: "90d", labelKey: "chartGroup12Range90d" },
];

const REVENUE_BY_RANGE: Record<DateRange, RevenuePoint[]> = {
  "7d": [
    { labelKey: "chartGroup12Day1", revenue: 4100, expenses: 2900 },
    { labelKey: "chartGroup12Day2", revenue: 5200, expenses: 3300 },
    { labelKey: "chartGroup12Day3", revenue: 3800, expenses: 2700 },
    { labelKey: "chartGroup12Day4", revenue: 6100, expenses: 3600 },
    { labelKey: "chartGroup12Day5", revenue: 5400, expenses: 3100 },
    { labelKey: "chartGroup12Day6", revenue: 7200, expenses: 4200 },
    { labelKey: "chartGroup12Day7", revenue: 6600, expenses: 3900 },
  ],
  "30d": [
    { labelKey: "chartGroup12Week1", revenue: 21400, expenses: 14200 },
    { labelKey: "chartGroup12Week2", revenue: 24800, expenses: 16100 },
    { labelKey: "chartGroup12Week3", revenue: 22900, expenses: 15500 },
    { labelKey: "chartGroup12Week4", revenue: 27300, expenses: 17800 },
    { labelKey: "chartGroup12Week5", revenue: 30100, expenses: 19300 },
  ],
  "90d": [
    { labelKey: "chartGroup12Month1", revenue: 68200, expenses: 47100 },
    { labelKey: "chartGroup12Month2", revenue: 75900, expenses: 51200 },
    { labelKey: "chartGroup12Month3", revenue: 71600, expenses: 48900 },
    { labelKey: "chartGroup12Month4", revenue: 84200, expenses: 55300 },
    { labelKey: "chartGroup12Month5", revenue: 91800, expenses: 59200 },
    { labelKey: "chartGroup12Month6", revenue: 102400, expenses: 63800 },
  ],
};

const USERS_BY_RANGE: Record<DateRange, UserPoint[]> = {
  "7d": [
    { labelKey: "chartGroup12Day1", users: 1480, sessions: 2310 },
    { labelKey: "chartGroup12Day2", users: 1720, sessions: 2640 },
    { labelKey: "chartGroup12Day3", users: 1340, sessions: 2180 },
    { labelKey: "chartGroup12Day4", users: 1980, sessions: 3020 },
    { labelKey: "chartGroup12Day5", users: 1850, sessions: 2890 },
    { labelKey: "chartGroup12Day6", users: 2310, sessions: 3450 },
    { labelKey: "chartGroup12Day7", users: 2140, sessions: 3290 },
  ],
  "30d": [
    { labelKey: "chartGroup12Week1", users: 8820, sessions: 12410 },
    { labelKey: "chartGroup12Week2", users: 9650, sessions: 13820 },
    { labelKey: "chartGroup12Week3", users: 9120, sessions: 13150 },
    { labelKey: "chartGroup12Week4", users: 10480, sessions: 14990 },
    { labelKey: "chartGroup12Week5", users: 11560, sessions: 16280 },
  ],
  "90d": [
    { labelKey: "chartGroup12Month1", users: 41200, sessions: 58600 },
    { labelKey: "chartGroup12Month2", users: 45800, sessions: 63400 },
    { labelKey: "chartGroup12Month3", users: 43100, sessions: 61200 },
    { labelKey: "chartGroup12Month4", users: 49700, sessions: 68900 },
    { labelKey: "chartGroup12Month5", users: 53800, sessions: 74200 },
    { labelKey: "chartGroup12Month6", users: 59400, sessions: 81300 },
  ],
};

const STATS_BY_RANGE: Record<DateRange, StatDatum[]> = {
  "7d": [
    {
      labelKey: "chartGroup12Stat1Label",
      valueKey: "chartGroup12Stat1Value7d",
      deltaKey: "chartGroup12Stat1Delta7d",
    },
    {
      labelKey: "chartGroup12Stat2Label",
      valueKey: "chartGroup12Stat2Value7d",
      deltaKey: "chartGroup12Stat2Delta7d",
    },
    {
      labelKey: "chartGroup12Stat3Label",
      valueKey: "chartGroup12Stat3Value7d",
      deltaKey: "chartGroup12Stat3Delta7d",
    },
    {
      labelKey: "chartGroup12Stat4Label",
      valueKey: "chartGroup12Stat4Value7d",
      deltaKey: "chartGroup12Stat4Delta7d",
    },
  ],
  "30d": [
    {
      labelKey: "chartGroup12Stat1Label",
      valueKey: "chartGroup12Stat1Value30d",
      deltaKey: "chartGroup12Stat1Delta30d",
    },
    {
      labelKey: "chartGroup12Stat2Label",
      valueKey: "chartGroup12Stat2Value30d",
      deltaKey: "chartGroup12Stat2Delta30d",
    },
    {
      labelKey: "chartGroup12Stat3Label",
      valueKey: "chartGroup12Stat3Value30d",
      deltaKey: "chartGroup12Stat3Delta30d",
    },
    {
      labelKey: "chartGroup12Stat4Label",
      valueKey: "chartGroup12Stat4Value30d",
      deltaKey: "chartGroup12Stat4Delta30d",
    },
  ],
  "90d": [
    {
      labelKey: "chartGroup12Stat1Label",
      valueKey: "chartGroup12Stat1Value90d",
      deltaKey: "chartGroup12Stat1Delta90d",
    },
    {
      labelKey: "chartGroup12Stat2Label",
      valueKey: "chartGroup12Stat2Value90d",
      deltaKey: "chartGroup12Stat2Delta90d",
    },
    {
      labelKey: "chartGroup12Stat3Label",
      valueKey: "chartGroup12Stat3Value90d",
      deltaKey: "chartGroup12Stat3Delta90d",
    },
    {
      labelKey: "chartGroup12Stat4Label",
      valueKey: "chartGroup12Stat4Value90d",
      deltaKey: "chartGroup12Stat4Delta90d",
    },
  ],
};

const WEEKLY_POINTS: WeeklyPoint[] = [
  { labelKey: "chartGroup12Day1", current: 4200, previous: 3900 },
  { labelKey: "chartGroup12Day2", current: 3800, previous: 4100 },
  { labelKey: "chartGroup12Day3", current: 5100, previous: 4400 },
  { labelKey: "chartGroup12Day4", current: 4600, previous: 5200 },
  { labelKey: "chartGroup12Day5", current: 5900, previous: 4800 },
  { labelKey: "chartGroup12Day6", current: 6800, previous: 6100 },
  { labelKey: "chartGroup12Day7", current: 7200, previous: 5800 },
];

const CHANNEL_POINTS: ChannelPoint[] = [
  { nameKey: "chartGroup12Channel1", value: 48, color: "hsl(var(--brand))" },
  { nameKey: "chartGroup12Channel2", value: 24, color: "hsl(var(--info))" },
  { nameKey: "chartGroup12Channel3", value: 17, color: "hsl(var(--success))" },
  { nameKey: "chartGroup12Channel4", value: 11, color: "hsl(var(--warning))" },
];

function handleRangeSelect(
  range: DateRange,
  setRange: Dispatch<SetStateAction<DateRange>>,
) {
  setRange(range);
}

function deltaTone(delta: string) {
  return delta.startsWith("-")
    ? "bg-error/10 text-error"
    : "bg-success/10 text-success";
}

function mapRevenuePoints(points: RevenuePoint[], cg: ChartGroupMessages) {
  return points.map((point) => ({
    label: cg[point.labelKey],
    revenue: point.revenue,
    expenses: point.expenses,
  }));
}

function mapUserPoints(points: UserPoint[], cg: ChartGroupMessages) {
  return points.map((point) => ({
    label: cg[point.labelKey],
    users: point.users,
    sessions: point.sessions,
  }));
}

function mapWeeklyPoints(cg: ChartGroupMessages): MappedWeeklyPoint[] {
  return WEEKLY_POINTS.map((point) => ({
    label: cg[point.labelKey],
    current: point.current,
    previous: point.previous,
  }));
}

function mapChannelPoints(cg: ChartGroupMessages): MappedChannelPoint[] {
  return CHANNEL_POINTS.map((point) => ({
    name: cg[point.nameKey],
    value: point.value,
  }));
}

function StatCard({ stat, cg }: { stat: StatDatum; cg: ChartGroupMessages }) {
  const delta = cg[stat.deltaKey];
  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-3xl border p-6">
      <Typography variant="caption">{cg[stat.labelKey]}</Typography>
      <span className="text-2xl font-semibold tracking-tight">
        {cg[stat.valueKey]}
      </span>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          deltaTone(delta),
        )}
      >
        {delta}
      </span>
    </div>
  );
}

function RevenueChartCard({
  points,
  cg,
}: {
  points: MappedRevenuePoint[];
  cg: ChartGroupMessages;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup12RevenueTitle}
      </Typography>
      <Chart type="area" data={points} height={260}>
        <defs>
          <linearGradient
            id="chartGroup12RevenueGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id="chartGroup12ExpensesGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          name={cg.chartGroup12Revenue}
          stroke="hsl(var(--brand))"
          fill="url(#chartGroup12RevenueGradient)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name={cg.chartGroup12Expenses}
          stroke="hsl(var(--muted))"
          fill="url(#chartGroup12ExpensesGradient)"
        />
      </Chart>
    </div>
  );
}

function ChannelsChartCard({ cg }: { cg: ChartGroupMessages }) {
  const channels = mapChannelPoints(cg);
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup12ChannelsTitle}
      </Typography>
      <Chart type="pie" data={channels} height={220}>
        <Pie
          data={channels}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={82}
          paddingAngle={3}
        >
          {CHANNEL_POINTS.map((channel) => (
            <Cell key={channel.nameKey} fill={channel.color} />
          ))}
        </Pie>
        <Tooltip />
      </Chart>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {CHANNEL_POINTS.map((channel) => (
          <span
            key={channel.nameKey}
            className="text-muted flex items-center gap-1.5 text-xs"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: channel.color }}
            />
            {cg[channel.nameKey]}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeeklyChartCard({ cg }: { cg: ChartGroupMessages }) {
  const weekly = mapWeeklyPoints(cg);
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup12WeeklyTitle}
      </Typography>
      <Chart type="bar" data={weekly} height={220}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="current"
          name={cg.chartGroup12ThisWeek}
          fill="hsl(var(--brand))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="previous"
          name={cg.chartGroup12LastWeek}
          fill="hsl(var(--muted))"
          radius={[4, 4, 0, 0]}
        />
      </Chart>
    </div>
  );
}

function UsersChartCard({
  points,
  cg,
}: {
  points: MappedUserPoint[];
  cg: ChartGroupMessages;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2 lg:col-span-4">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup12UsersTitle}
      </Typography>
      <Chart type="line" data={points} height={240}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="users"
          name={cg.chartGroup12Users}
          stroke="hsl(var(--brand))"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          name={cg.chartGroup12Sessions}
          stroke="hsl(var(--info))"
          strokeWidth={2}
        />
      </Chart>
    </div>
  );
}

export function DashboardDateControls() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [range, setRange] = useState<DateRange>("30d");
  const revenuePoints = mapRevenuePoints(REVENUE_BY_RANGE[range], cg);
  const userPoints = mapUserPoints(USERS_BY_RANGE[range], cg);
  const stats = STATS_BY_RANGE[range];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {cg.chartGroup12Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cg.chartGroup12Description}
            </Typography>
          </div>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={range === option.value ? "default" : "outline"}
                onClick={() => handleRangeSelect(option.value, setRange)}
              >
                {cg[option.labelKey]}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} cg={cg} />
          ))}
          <RevenueChartCard points={revenuePoints} cg={cg} />
          <ChannelsChartCard cg={cg} />
          <WeeklyChartCard cg={cg} />
          <UsersChartCard points={userPoints} cg={cg} />
        </div>
      </div>
    </section>
  );
}
