"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import {
  Area,
  CartesianGrid,
  Chart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartCardMessages,
  PagesWithChartCardMessages,
} from "@/types/pages/chart-card/ChartCardMessages-types";

type Granularity = "weekly" | "monthly";

interface SourcePoint {
  labelKey: string;
  free: number;
  pro: number;
  enterprise: number;
}

interface MappedPoint extends Record<string, unknown> {
  label: string;
  free: number;
  pro: number;
  enterprise: number;
}

const WEEKLY_DATA: SourcePoint[] = [
  { labelKey: "chartCard9Week1", free: 320, pro: 180, enterprise: 40 },
  { labelKey: "chartCard9Week2", free: 360, pro: 210, enterprise: 52 },
  { labelKey: "chartCard9Week3", free: 340, pro: 240, enterprise: 58 },
  { labelKey: "chartCard9Week4", free: 410, pro: 265, enterprise: 64 },
  { labelKey: "chartCard9Week5", free: 450, pro: 300, enterprise: 76 },
];

const MONTHLY_DATA: SourcePoint[] = [
  { labelKey: "chartCard9Month1", free: 1380, pro: 820, enterprise: 190 },
  { labelKey: "chartCard9Month2", free: 1520, pro: 960, enterprise: 230 },
  { labelKey: "chartCard9Month3", free: 1640, pro: 1120, enterprise: 270 },
  { labelKey: "chartCard9Month4", free: 1810, pro: 1290, enterprise: 320 },
];

const DATASETS: Record<Granularity, SourcePoint[]> = {
  weekly: WEEKLY_DATA,
  monthly: MONTHLY_DATA,
};

function getData(c: ChartCardMessages, granularity: Granularity): MappedPoint[] {
  return DATASETS[granularity].map((point) => ({
    label: c[point.labelKey],
    free: point.free,
    pro: point.pro,
    enterprise: point.enterprise,
  }));
}

function handleGranularityChange(
  setGranularity: Dispatch<SetStateAction<Granularity>>,
  value: string,
) {
  if (value === "weekly" || value === "monthly") setGranularity(value);
}

export function SignupsStackedAreaChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const data = getData(c, granularity) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard9Title}</Typography>
          <Select
            value={granularity}
            onValueChange={(value) => handleGranularityChange(setGranularity, value)}
            name="chart-card-9-granularity"
          >
            <SelectTrigger className="w-36">
              {granularity === "weekly"
                ? c.chartCard9GranularityWeekly
                : c.chartCard9GranularityMonthly}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{c.chartCard9GranularityWeekly}</SelectItem>
              <SelectItem value="monthly">{c.chartCard9GranularityMonthly}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-5">
          <Chart type="area" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="free"
              stackId="plan"
              name={c.chartCard9SeriesFree}
              stroke="var(--brand)"
              fill="var(--brand)"
              fillOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="pro"
              stackId="plan"
              name={c.chartCard9SeriesPro}
              stroke="var(--info)"
              fill="var(--info)"
              fillOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="enterprise"
              stackId="plan"
              name={c.chartCard9SeriesEnterprise}
              stroke="var(--success)"
              fill="var(--success)"
              fillOpacity={0.75}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
