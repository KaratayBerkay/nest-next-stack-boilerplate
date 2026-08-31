"use client";

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

interface SourceDatum {
  weekKey: string;
  desktop: number;
  mobile: number;
  tablet: number;
}

const DEVICE_DATA: SourceDatum[] = [
  { weekKey: "chartCard11Week1", desktop: 58, mobile: 32, tablet: 10 },
  { weekKey: "chartCard11Week2", desktop: 55, mobile: 35, tablet: 10 },
  { weekKey: "chartCard11Week3", desktop: 52, mobile: 37, tablet: 11 },
  { weekKey: "chartCard11Week4", desktop: 49, mobile: 40, tablet: 11 },
];

export function DeviceMixStackedBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = DEVICE_DATA.map((item) => ({
    week: c[item.weekKey],
    desktop: item.desktop,
    mobile: item.mobile,
    tablet: item.tablet,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard11Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard11SeriesDesktop}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-info size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard11SeriesMobile}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-muted size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard11SeriesTablet}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <Chart type="bar" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar
              dataKey="desktop"
              stackId="device"
              name={c.chartCard11SeriesDesktop}
              fill="var(--brand)"
            />
            <Bar
              dataKey="mobile"
              stackId="device"
              name={c.chartCard11SeriesMobile}
              fill="var(--info)"
            />
            <Bar
              dataKey="tablet"
              stackId="device"
              name={c.chartCard11SeriesTablet}
              fill="var(--muted)"
              radius={[4, 4, 0, 0]}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
