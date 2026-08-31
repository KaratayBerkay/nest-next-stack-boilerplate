"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceDatum {
  monthKey: string;
  low: number;
  high: number;
  actual: number;
}

const FORECAST_DATA: SourceDatum[] = [
  { monthKey: "chartCard14Month1", low: 38000, high: 46000, actual: 41200 },
  { monthKey: "chartCard14Month2", low: 40000, high: 49000, actual: 45800 },
  { monthKey: "chartCard14Month3", low: 43000, high: 53000, actual: 47600 },
  { monthKey: "chartCard14Month4", low: 46000, high: 57000, actual: 55200 },
  { monthKey: "chartCard14Month5", low: 49000, high: 61000, actual: 58900 },
  { monthKey: "chartCard14Month6", low: 52000, high: 65000, actual: 63400 },
];

export function ForecastRangeAreaChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = FORECAST_DATA.map((item) => ({
    month: c[item.monthKey],
    low: item.low,
    band: item.high - item.low,
    actual: item.actual,
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard14Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="bg-brand/25 size-2.5 rounded-full" aria-hidden="true" />
              {c.chartCard14SeriesRange}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="bg-brand size-2.5 rounded-full" aria-hidden="true" />
              {c.chartCard14SeriesActual}
            </span>
          </div>
        </div>
        <div className="mt-5 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="low"
                stackId="range"
                stroke="none"
                fill="transparent"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="band"
                stackId="range"
                name={c.chartCard14SeriesRange}
                stroke="none"
                fill="var(--brand)"
                fillOpacity={0.18}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={c.chartCard14SeriesActual}
                stroke="var(--brand)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
