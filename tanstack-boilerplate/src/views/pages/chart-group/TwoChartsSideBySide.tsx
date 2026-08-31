"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

interface ChartGroup1Datum {
  monthKey: string;
  revenue: number;
  orders: number;
}

const CHART_GROUP_1_DATA: ChartGroup1Datum[] = [
  { monthKey: "chartGroup1Month1", revenue: 4200, orders: 240 },
  { monthKey: "chartGroup1Month2", revenue: 3800, orders: 215 },
  { monthKey: "chartGroup1Month3", revenue: 5100, orders: 290 },
  { monthKey: "chartGroup1Month4", revenue: 4700, orders: 265 },
  { monthKey: "chartGroup1Month5", revenue: 5900, orders: 340 },
  { monthKey: "chartGroup1Month6", revenue: 6400, orders: 372 },
  { monthKey: "chartGroup1Month7", revenue: 6100, orders: 355 },
  { monthKey: "chartGroup1Month8", revenue: 6800, orders: 398 },
  { monthKey: "chartGroup1Month9", revenue: 7200, orders: 420 },
  { monthKey: "chartGroup1Month10", revenue: 6900, orders: 405 },
  { monthKey: "chartGroup1Month11", revenue: 7800, orders: 462 },
  { monthKey: "chartGroup1Month12", revenue: 8600, orders: 510 },
];

export function TwoChartsSideBySide() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const chartData = CHART_GROUP_1_DATA.map((datum) => ({
    month: cg[datum.monthKey],
    revenue: datum.revenue,
    orders: datum.orders,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cg.chartGroup1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cg.chartGroup1Description}
          </Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <Typography variant="h5">{cg.chartGroup1Card1Title}</Typography>
            <Chart type="area" data={chartData} height={280}>
              <defs>
                <linearGradient
                  id="chartGroup1RevenueGradient"
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
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name={cg.chartGroup1Series1}
                stroke="var(--brand)"
                fill="url(#chartGroup1RevenueGradient)"
              />
            </Chart>
          </article>
          <article className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <Typography variant="h5">{cg.chartGroup1Card2Title}</Typography>
            <Chart type="bar" data={chartData} height={280}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="orders"
                name={cg.chartGroup1Series2}
                fill="var(--info)"
                radius={[6, 6, 0, 0]}
              />
            </Chart>
          </article>
        </div>
      </div>
    </section>
  );
}
