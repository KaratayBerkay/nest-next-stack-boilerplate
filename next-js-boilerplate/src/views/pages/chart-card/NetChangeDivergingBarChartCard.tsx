"use client";

import { Cell, ReferenceLine } from "recharts";
import {
  Bar,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SegmentDatum {
  nameKey: string;
  value: number;
}

const SEGMENT_DATA: SegmentDatum[] = [
  { nameKey: "chartCard13Segment1", value: 18 },
  { nameKey: "chartCard13Segment2", value: 9 },
  { nameKey: "chartCard13Segment3", value: -4 },
  { nameKey: "chartCard13Segment4", value: 6 },
  { nameKey: "chartCard13Segment5", value: -11 },
];

export function NetChangeDivergingBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = SEGMENT_DATA.map((item) => ({
    name: c[item.nameKey],
    value: item.value,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard13Title}</Typography>
        <div className="mt-5">
          <Chart type="bar" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar
              dataKey="value"
              name={c.chartCard13Title}
              radius={[4, 4, 4, 4]}
            >
              {SEGMENT_DATA.map((segment) => (
                <Cell
                  key={segment.nameKey}
                  fill={segment.value >= 0 ? "var(--success)" : "var(--error)"}
                />
              ))}
            </Bar>
          </Chart>
        </div>
      </div>
    </div>
  );
}
