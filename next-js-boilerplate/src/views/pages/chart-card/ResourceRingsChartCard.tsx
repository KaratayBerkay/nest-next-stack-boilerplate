"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface RingDatum {
  labelKey: string;
  valueKey: string;
  value: number;
  color: string;
}

const RING_DATA: RingDatum[] = [
  {
    labelKey: "chartCard18RingCpuLabel",
    valueKey: "chartCard18RingCpuValue",
    value: 62,
    color: "var(--brand)",
  },
  {
    labelKey: "chartCard18RingMemoryLabel",
    valueKey: "chartCard18RingMemoryValue",
    value: 48,
    color: "var(--info)",
  },
  {
    labelKey: "chartCard18RingStorageLabel",
    valueKey: "chartCard18RingStorageValue",
    value: 81,
    color: "var(--warning)",
  },
];

export function ResourceRingsChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = RING_DATA.map((ring) => ({
    name: c[ring.labelKey],
    value: ring.value,
    fill: ring.color,
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard18Title}</Typography>
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              innerRadius="30%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barSize={12}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="value"
                background={{ fill: "var(--surface)" }}
                cornerRadius={6}
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-col gap-2.5">
          {RING_DATA.map((ring) => (
            <div
              key={ring.labelKey}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: ring.color }}
                  aria-hidden="true"
                />
                {c[ring.labelKey]}
              </span>
              <span className="text-muted tabular-nums">
                {c[ring.valueKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
