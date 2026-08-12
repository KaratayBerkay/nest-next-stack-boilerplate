"use client";

import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartGroupMessages,
  PagesWithChartGroupMessages,
} from "@/types/pages/chart-group/ChartGroupMessages-types";

interface YearOverYearSourceDatum {
  monthKey: string;
  thisYear: number;
  lastYear: number;
}

interface YearOverYearDatum {
  month: string;
  thisYear: number;
  lastYear: number;
}

const YEAR_OVER_YEAR_DATA: YearOverYearSourceDatum[] = [
  { monthKey: "chartGroup5Month1", thisYear: 4200, lastYear: 3600 },
  { monthKey: "chartGroup5Month2", thisYear: 3800, lastYear: 3400 },
  { monthKey: "chartGroup5Month3", thisYear: 5100, lastYear: 4300 },
  { monthKey: "chartGroup5Month4", thisYear: 4800, lastYear: 4100 },
  { monthKey: "chartGroup5Month5", thisYear: 6100, lastYear: 4900 },
  { monthKey: "chartGroup5Month6", thisYear: 5700, lastYear: 4700 },
  { monthKey: "chartGroup5Month7", thisYear: 6900, lastYear: 5400 },
  { monthKey: "chartGroup5Month8", thisYear: 7400, lastYear: 5900 },
  { monthKey: "chartGroup5Month9", thisYear: 6600, lastYear: 5500 },
  { monthKey: "chartGroup5Month10", thisYear: 7900, lastYear: 6200 },
  { monthKey: "chartGroup5Month11", thisYear: 8500, lastYear: 6800 },
  { monthKey: "chartGroup5Month12", thisYear: 9200, lastYear: 7400 },
];

function getYearOverYearData(cg: ChartGroupMessages): YearOverYearDatum[] {
  return YEAR_OVER_YEAR_DATA.map((item) => ({
    month: cg[item.monthKey],
    thisYear: item.thisYear,
    lastYear: item.lastYear,
  }));
}

export function YearOverYearComparison() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const chartData = getYearOverYearData(cg) as unknown as Record<
    string,
    unknown
  >[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup5Description}
          </Typography>
        </div>
        <div className="border-border bg-surface rounded-3xl border p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Typography variant="h3">{cg.chartGroup5CardTitle}</Typography>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="bg-brand size-2.5 rounded-full"
                  aria-hidden="true"
                />
                {cg.chartGroup5Series1Label}
              </span>
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="bg-muted size-2.5 rounded-full"
                  aria-hidden="true"
                />
                {cg.chartGroup5Series2Label}
              </span>
            </div>
          </div>
          <Chart type="line" data={chartData} height={320}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="thisYear"
              name={cg.chartGroup5Series1Label}
              stroke="hsl(var(--brand))"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="lastYear"
              name={cg.chartGroup5Series2Label}
              stroke="hsl(var(--muted))"
              strokeWidth={2}
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
