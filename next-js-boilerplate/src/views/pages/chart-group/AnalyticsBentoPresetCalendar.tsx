"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Cell } from "recharts";
import {
  Area,
  CartesianGrid,
  Chart,
  Legend,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { addDays } from "@/lib/date-time";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

type ChartGroupMessages = PagesWithChartGroupMessages["chartGroup"];
type Preset = "today" | "7d" | "30d";

interface ActivityPoint {
  labelKey: string;
  visitors: number;
  sessions: number;
}

interface MappedActivityPoint extends Record<string, unknown> {
  label: string;
  visitors: number;
  sessions: number;
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

interface PresetOption {
  value: Preset;
  labelKey: string;
}

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { value: "today", labelKey: "chartGroup13PresetToday" },
  { value: "7d", labelKey: "chartGroup13Preset7d" },
  { value: "30d", labelKey: "chartGroup13Preset30d" },
];

const ACTIVITY_BY_PRESET: Record<Preset, ActivityPoint[]> = {
  today: [
    { labelKey: "chartGroup13Hour1", visitors: 620, sessions: 840 },
    { labelKey: "chartGroup13Hour2", visitors: 940, sessions: 1310 },
    { labelKey: "chartGroup13Hour3", visitors: 1580, sessions: 2140 },
    { labelKey: "chartGroup13Hour4", visitors: 2310, sessions: 3080 },
    { labelKey: "chartGroup13Hour5", visitors: 1870, sessions: 2540 },
    { labelKey: "chartGroup13Hour6", visitors: 1490, sessions: 2060 },
  ],
  "7d": [
    { labelKey: "chartGroup13D1", visitors: 4120, sessions: 5810 },
    { labelKey: "chartGroup13D2", visitors: 5280, sessions: 7240 },
    { labelKey: "chartGroup13D3", visitors: 4710, sessions: 6680 },
    { labelKey: "chartGroup13D4", visitors: 6340, sessions: 8710 },
    { labelKey: "chartGroup13D5", visitors: 5960, sessions: 8240 },
    { labelKey: "chartGroup13D6", visitors: 7820, sessions: 10490 },
    { labelKey: "chartGroup13D7", visitors: 7410, sessions: 9970 },
  ],
  "30d": [
    { labelKey: "chartGroup13W1", visitors: 31200, sessions: 42800 },
    { labelKey: "chartGroup13W2", visitors: 34800, sessions: 47200 },
    { labelKey: "chartGroup13W3", visitors: 32900, sessions: 45100 },
    { labelKey: "chartGroup13W4", visitors: 38700, sessions: 52300 },
    { labelKey: "chartGroup13W5", visitors: 42100, sessions: 56400 },
  ],
};

const PRESET_STATS: StatDatum[] = [
  {
    labelKey: "chartGroup13Stat1Label",
    valueKey: "chartGroup13Stat1Value",
    deltaKey: "chartGroup13Stat1Delta",
  },
  {
    labelKey: "chartGroup13Stat2Label",
    valueKey: "chartGroup13Stat2Value",
    deltaKey: "chartGroup13Stat2Delta",
  },
  {
    labelKey: "chartGroup13Stat3Label",
    valueKey: "chartGroup13Stat3Value",
    deltaKey: "chartGroup13Stat3Delta",
  },
];

const CHANNEL_POINTS: ChannelPoint[] = [
  { nameKey: "chartGroup13Channel1", value: 42, color: "hsl(var(--brand))" },
  { nameKey: "chartGroup13Channel2", value: 26, color: "hsl(var(--info))" },
  { nameKey: "chartGroup13Channel3", value: 19, color: "hsl(var(--success))" },
  { nameKey: "chartGroup13Channel4", value: 13, color: "hsl(var(--warning))" },
];

function handlePresetSelect(
  preset: Preset,
  setDate: Dispatch<SetStateAction<Date | undefined>>,
  setPreset: Dispatch<SetStateAction<Preset>>,
) {
  const today = new Date();
  if (preset === "today") {
    setDate(today);
  } else if (preset === "7d") {
    setDate(addDays(today, -7));
  } else {
    setDate(addDays(today, -30));
  }
  setPreset(preset);
}

function handleCalendarSelect(
  date: Date | undefined,
  setDate: Dispatch<SetStateAction<Date | undefined>>,
) {
  setDate(date);
}

function deltaTone(delta: string) {
  return delta.startsWith("-")
    ? "bg-error/10 text-error"
    : "bg-success/10 text-success";
}

function mapActivityPoints(points: ActivityPoint[], cg: ChartGroupMessages) {
  return points.map((point) => ({
    label: cg[point.labelKey],
    visitors: point.visitors,
    sessions: point.sessions,
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

function ActivityChartCard({
  points,
  cg,
}: {
  points: MappedActivityPoint[];
  cg: ChartGroupMessages;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup13ActivityTitle}
      </Typography>
      <Chart type="area" data={points} height={260}>
        <defs>
          <linearGradient
            id="chartGroup13VisitorsGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="visitors"
          name={cg.chartGroup13Visitors}
          stroke="hsl(var(--brand))"
          fill="url(#chartGroup13VisitorsGradient)"
        />
        <Area
          type="monotone"
          dataKey="sessions"
          name={cg.chartGroup13Sessions}
          stroke="hsl(var(--info))"
          fill="hsl(var(--info))"
          fillOpacity={0.15}
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
        {cg.chartGroup13ChannelsTitle}
      </Typography>
      <Chart type="pie" data={channels} height={200}>
        <Pie
          data={channels}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={76}
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

function CalendarCard({
  date,
  setDate,
  cg,
}: {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  cg: ChartGroupMessages;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2">
      <Typography variant="body" className="font-medium">
        {cg.chartGroup13CalendarTitle}
      </Typography>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(day) => handleCalendarSelect(day, setDate)}
      />
    </div>
  );
}

export function AnalyticsBentoPresetCalendar() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [preset, setPreset] = useState<Preset>("7d");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const activityPoints = mapActivityPoints(ACTIVITY_BY_PRESET[preset], cg);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {cg.chartGroup13Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cg.chartGroup13Description}
            </Typography>
          </div>
          <div className="flex gap-1">
            {PRESET_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={preset === option.value ? "default" : "outline"}
                onClick={() =>
                  handlePresetSelect(option.value, setDate, setPreset)
                }
              >
                {cg[option.labelKey]}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRESET_STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} cg={cg} />
          ))}
          <ChannelsChartCard cg={cg} />
          <ActivityChartCard points={activityPoints} cg={cg} />
          <CalendarCard date={date} setDate={setDate} cg={cg} />
        </div>
      </div>
    </section>
  );
}
