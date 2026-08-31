"use client";

import { ReferenceArea } from "recharts";
import { IconCircleCheck } from "@tabler/icons-react";
import {
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourcePoint {
  labelKey: string;
  latency: number;
}

const LATENCY_DATA: SourcePoint[] = [
  { labelKey: "chartCard27Point1", latency: 120 },
  { labelKey: "chartCard27Point2", latency: 135 },
  { labelKey: "chartCard27Point3", latency: 128 },
  { labelKey: "chartCard27Point4", latency: 210 },
  { labelKey: "chartCard27Point5", latency: 265 },
  { labelKey: "chartCard27Point6", latency: 190 },
  { labelKey: "chartCard27Point7", latency: 142 },
  { labelKey: "chartCard27Point8", latency: 118 },
];

export function LatencyThresholdZonesChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = LATENCY_DATA.map((item) => ({
    label: c[item.labelKey],
    latency: item.latency,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard27Title}</Typography>
          <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <IconCircleCheck size={14} aria-hidden="true" />
            {c.chartCard27StatusValue}
          </span>
        </div>
        <div className="mt-5">
          <Chart type="line" data={data} height={220}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 300]} />
            <Tooltip />
            <ReferenceArea
              y1={0}
              y2={150}
              fill="var(--success)"
              fillOpacity={0.08}
            />
            <ReferenceArea
              y1={150}
              y2={220}
              fill="var(--warning)"
              fillOpacity={0.1}
            />
            <ReferenceArea
              y1={220}
              y2={300}
              fill="var(--error)"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="latency"
              name={c.chartCard27SeriesLabel}
              stroke="var(--brand)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </Chart>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs">
            <span
              className="bg-success size-2.5 rounded-full"
              aria-hidden="true"
            />
            {c.chartCard27ZoneGoodLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span
              className="bg-warning size-2.5 rounded-full"
              aria-hidden="true"
            />
            {c.chartCard27ZoneWarningLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span
              className="bg-error size-2.5 rounded-full"
              aria-hidden="true"
            />
            {c.chartCard27ZoneCriticalLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
