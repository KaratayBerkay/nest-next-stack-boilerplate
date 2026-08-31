"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Area,
  CartesianGrid,
  Chart,
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

type Period = "7d" | "30d" | "90d";

interface SourcePoint {
  labelKey: string;
  visitors: number;
}

interface MappedPoint extends Record<string, unknown> {
  label: string;
  visitors: number;
}

const DAY_DATA: SourcePoint[] = [
  { labelKey: "chartCard2Day1", visitors: 1120 },
  { labelKey: "chartCard2Day2", visitors: 1340 },
  { labelKey: "chartCard2Day3", visitors: 1260 },
  { labelKey: "chartCard2Day4", visitors: 1480 },
  { labelKey: "chartCard2Day5", visitors: 1710 },
  { labelKey: "chartCard2Day6", visitors: 1390 },
  { labelKey: "chartCard2Day7", visitors: 1580 },
];

const WEEK_DATA: SourcePoint[] = [
  { labelKey: "chartCard2Week1", visitors: 7200 },
  { labelKey: "chartCard2Week2", visitors: 8400 },
  { labelKey: "chartCard2Week3", visitors: 7900 },
  { labelKey: "chartCard2Week4", visitors: 9600 },
];

const MONTH_DATA: SourcePoint[] = [
  { labelKey: "chartCard2Month1", visitors: 28400 },
  { labelKey: "chartCard2Month2", visitors: 33200 },
  { labelKey: "chartCard2Month3", visitors: 39800 },
];

const DATASETS: Record<Period, SourcePoint[]> = {
  "7d": DAY_DATA,
  "30d": WEEK_DATA,
  "90d": MONTH_DATA,
};

function getData(c: ChartCardMessages, period: Period): MappedPoint[] {
  return DATASETS[period].map((point) => ({
    label: c[point.labelKey],
    visitors: point.visitors,
  }));
}

function handlePeriodChange(
  value: string,
  setPeriod: Dispatch<SetStateAction<Period>>,
) {
  if (value === "7d" || value === "30d" || value === "90d") setPeriod(value);
}

export function VisitorsPeriodToggleChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const [period, setPeriod] = useState<Period>("30d");
  const data = getData(c, period) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard2Title}</Typography>
          <Tabs
            value={period}
            onValueChange={(value) => handlePeriodChange(value, setPeriod)}
          >
            <TabsList>
              <TabsTrigger value="7d">{c.chartCard2Period7}</TabsTrigger>
              <TabsTrigger value="30d">{c.chartCard2Period30}</TabsTrigger>
              <TabsTrigger value="90d">{c.chartCard2Period90}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-5">
          <Chart type="area" data={data} height={220}>
            <defs>
              <linearGradient id="chartCard2Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="visitors"
              name={c.chartCard2SeriesLabel}
              stroke="var(--brand)"
              fill="url(#chartCard2Fill)"
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
