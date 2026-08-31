"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface AxisDatum {
  axisKey: string;
  current: number;
  previous: number;
}

const RADAR_DATA: AxisDatum[] = [
  { axisKey: "chartCard20Axis1", current: 88, previous: 72 },
  { axisKey: "chartCard20Axis2", current: 76, previous: 68 },
  { axisKey: "chartCard20Axis3", current: 92, previous: 80 },
  { axisKey: "chartCard20Axis4", current: 65, previous: 70 },
  { axisKey: "chartCard20Axis5", current: 81, previous: 74 },
];

export function TeamRadarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = RADAR_DATA.map((item) => ({
    axis: c[item.axisKey],
    current: item.current,
    previous: item.previous,
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard20Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="bg-brand size-2.5 rounded-full" aria-hidden="true" />
              {c.chartCard20SeriesCurrent}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="bg-muted size-2.5 rounded-full" aria-hidden="true" />
              {c.chartCard20SeriesPrevious}
            </span>
          </div>
        </div>
        <div className="mt-4 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Radar
                name={c.chartCard20SeriesCurrent}
                dataKey="current"
                stroke="var(--brand)"
                fill="var(--brand)"
                fillOpacity={0.35}
              />
              <Radar
                name={c.chartCard20SeriesPrevious}
                dataKey="previous"
                stroke="var(--muted)"
                fill="var(--muted)"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
