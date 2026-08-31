"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

interface ChartGroup3Datum {
  monthKey: string;
  monthlyRevenue: number;
}

interface ChartGroup3DayDatum {
  day: string;
  value: number;
}

const CHART_GROUP_3_DATA: ChartGroup3Datum[] = [
  { monthKey: "chartGroup3Month1", monthlyRevenue: 12400 },
  { monthKey: "chartGroup3Month2", monthlyRevenue: 13800 },
  { monthKey: "chartGroup3Month3", monthlyRevenue: 13100 },
  { monthKey: "chartGroup3Month4", monthlyRevenue: 14500 },
  { monthKey: "chartGroup3Month5", monthlyRevenue: 15200 },
  { monthKey: "chartGroup3Month6", monthlyRevenue: 14900 },
  { monthKey: "chartGroup3Month7", monthlyRevenue: 16200 },
  { monthKey: "chartGroup3Month8", monthlyRevenue: 17500 },
  { monthKey: "chartGroup3Month9", monthlyRevenue: 16800 },
  { monthKey: "chartGroup3Month10", monthlyRevenue: 18200 },
  { monthKey: "chartGroup3Month11", monthlyRevenue: 19600 },
  { monthKey: "chartGroup3Month12", monthlyRevenue: 21400 },
];

const CHART_GROUP_3_WEEK_DATA: ChartGroup3DayDatum[] = [
  { day: "Mon", value: 1240 },
  { day: "Tue", value: 1420 },
  { day: "Wed", value: 1180 },
  { day: "Thu", value: 1560 },
  { day: "Fri", value: 1730 },
  { day: "Sat", value: 980 },
  { day: "Sun", value: 1120 },
];

export function MainWithWeeklyTrends() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const chartData = CHART_GROUP_3_DATA.map((datum) => ({
    month: cg[datum.monthKey],
    monthlyRevenue: datum.monthlyRevenue,
  }));
  const weekData = CHART_GROUP_3_WEEK_DATA.map((datum) => ({
    day: datum.day,
    value: datum.value,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cg.chartGroup3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cg.chartGroup3Description}
          </Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 md:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Typography variant="h5">{cg.chartGroup3Card1Title}</Typography>
              <span className="text-fg text-3xl font-semibold tracking-tight">
                $193,600
              </span>
            </div>
            <Chart type="area" data={chartData} height={300}>
              <defs>
                <linearGradient
                  id="chartGroup3RevenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={1} />
                  <stop
                    offset="100%"
                    stopColor="var(--brand)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="monthlyRevenue"
                name={cg.chartGroup3Series1}
                stroke="var(--brand)"
                fill="url(#chartGroup3RevenueGradient)"
              />
            </Chart>
          </article>
          <article className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Typography variant="h5">{cg.chartGroup3Card2Title}</Typography>
              <span className="text-fg text-3xl font-semibold tracking-tight">
                $9,230
              </span>
            </div>
            <Chart type="bar" data={weekData} height={240}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis hide />
              <Tooltip />
              <Bar
                dataKey="value"
                name={cg.chartGroup3Series2}
                fill="var(--info)"
                radius={[4, 4, 0, 0]}
              />
            </Chart>
          </article>
        </div>
      </div>
    </section>
  );
}
