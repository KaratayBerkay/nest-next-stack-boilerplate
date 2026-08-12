"use client";

import { useState } from "react";
import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "@/components/ui/Chart";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Dispatch, SetStateAction } from "react";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";
import type { DateRangeValue } from "@/types/ui/DateRangePicker-types";

interface ChartGroup11Point {
  labelKey: string;
  revenue: number;
  profit: number;
}

const CHART_GROUP_11_REVENUE: ChartGroup11Point[] = [
  { labelKey: "chartGroup11Month1", revenue: 4200, profit: 1900 },
  { labelKey: "chartGroup11Month2", revenue: 3800, profit: 1700 },
  { labelKey: "chartGroup11Month3", revenue: 5100, profit: 2300 },
  { labelKey: "chartGroup11Month4", revenue: 4700, profit: 2100 },
  { labelKey: "chartGroup11Month5", revenue: 5600, profit: 2600 },
  { labelKey: "chartGroup11Month6", revenue: 6200, profit: 2900 },
  { labelKey: "chartGroup11Month7", revenue: 5800, profit: 2700 },
  { labelKey: "chartGroup11Month8", revenue: 6600, profit: 3100 },
  { labelKey: "chartGroup11Month9", revenue: 7100, profit: 3300 },
  { labelKey: "chartGroup11Month10", revenue: 6900, profit: 3200 },
  { labelKey: "chartGroup11Month11", revenue: 7600, profit: 3600 },
  { labelKey: "chartGroup11Month12", revenue: 8200, profit: 3900 },
];

function handleRangeChange(
  setRange: Dispatch<SetStateAction<DateRangeValue | undefined>>,
  range: DateRangeValue | undefined,
) {
  setRange(range);
}

export function RevenueDateRangePicker() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [range, setRange] = useState<DateRangeValue>();
  const chartData = CHART_GROUP_11_REVENUE.map((p) => ({
    label: cg[p.labelKey],
    revenue: p.revenue,
    profit: p.profit,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup11Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup11Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup11CardTitle}
            </Typography>
            <DateRangePicker
              value={range}
              onChange={(newRange) => handleRangeChange(setRange, newRange)}
              className="w-64"
            />
          </div>
          <Chart type="area" data={chartData} height={300}>
            <defs>
              <linearGradient
                id="chartGroup11RevenueFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--brand))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--brand))"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="chartGroup11ProfitFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--success))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--success))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name={cg.chartGroup11SeriesRevenue}
              stroke="hsl(var(--brand))"
              fill="url(#chartGroup11RevenueFill)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              name={cg.chartGroup11SeriesProfit}
              stroke="hsl(var(--success))"
              fill="url(#chartGroup11ProfitFill)"
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
