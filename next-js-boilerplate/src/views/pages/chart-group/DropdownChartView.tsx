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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Dispatch, SetStateAction } from "react";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

type ChartGroup9View = "all" | "quarter" | "month";

interface ChartGroup9Point {
  labelKey: string;
  visitors: number;
  purchases: number;
}

interface ChartGroup9Option {
  value: ChartGroup9View;
  labelKey: string;
}

const CHART_GROUP_9_OPTIONS: ChartGroup9Option[] = [
  { value: "all", labelKey: "chartGroup9Option1" },
  { value: "quarter", labelKey: "chartGroup9Option2" },
  { value: "month", labelKey: "chartGroup9Option3" },
];

const CHART_GROUP_9_ALL_TIME: ChartGroup9Point[] = [
  { labelKey: "chartGroup9Month1", visitors: 3100, purchases: 180 },
  { labelKey: "chartGroup9Month2", visitors: 2900, purchases: 210 },
  { labelKey: "chartGroup9Month3", visitors: 3400, purchases: 240 },
  { labelKey: "chartGroup9Month4", visitors: 3600, purchases: 260 },
  { labelKey: "chartGroup9Month5", visitors: 3900, purchases: 280 },
  { labelKey: "chartGroup9Month6", visitors: 4200, purchases: 310 },
  { labelKey: "chartGroup9Month7", visitors: 4100, purchases: 300 },
  { labelKey: "chartGroup9Month8", visitors: 4500, purchases: 340 },
  { labelKey: "chartGroup9Month9", visitors: 4800, purchases: 360 },
  { labelKey: "chartGroup9Month10", visitors: 4700, purchases: 350 },
  { labelKey: "chartGroup9Month11", visitors: 5200, purchases: 390 },
  { labelKey: "chartGroup9Month12", visitors: 5600, purchases: 430 },
];

const CHART_GROUP_9_QUARTER: ChartGroup9Point[] = [
  { labelKey: "chartGroup9Quarter1", visitors: 9400, purchases: 630 },
  { labelKey: "chartGroup9Quarter2", visitors: 11700, purchases: 850 },
  { labelKey: "chartGroup9Quarter3", visitors: 14000, purchases: 1050 },
];

const CHART_GROUP_9_MONTH: ChartGroup9Point[] = [
  { labelKey: "chartGroup9Week1", visitors: 1150, purchases: 82 },
  { labelKey: "chartGroup9Week2", visitors: 1280, purchases: 95 },
  { labelKey: "chartGroup9Week3", visitors: 1240, purchases: 91 },
  { labelKey: "chartGroup9Week4", visitors: 1370, purchases: 105 },
];

const CHART_GROUP_9_DATASETS: Record<ChartGroup9View, ChartGroup9Point[]> = {
  all: CHART_GROUP_9_ALL_TIME,
  quarter: CHART_GROUP_9_QUARTER,
  month: CHART_GROUP_9_MONTH,
};

function handleViewChange(
  setView: Dispatch<SetStateAction<ChartGroup9View>>,
  value: string,
) {
  if (value === "all" || value === "quarter" || value === "month") {
    setView(value);
  }
}

function selectedOptionLabel(
  view: ChartGroup9View,
  cg: Record<string, string>,
) {
  const option = CHART_GROUP_9_OPTIONS.find((o) => o.value === view);
  return option ? cg[option.labelKey] : "";
}

export function DropdownChartView() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [view, setView] = useState<ChartGroup9View>("all");
  const chartData = CHART_GROUP_9_DATASETS[view].map((p) => ({
    label: cg[p.labelKey],
    visitors: p.visitors,
    purchases: p.purchases,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup9Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup9CardTitle}
            </Typography>
            <Select
              value={view}
              onValueChange={(value) => handleViewChange(setView, value)}
              name="chart-group-9-view"
            >
              <SelectTrigger className="w-44">
                {selectedOptionLabel(view, cg)}
              </SelectTrigger>
              <SelectContent>
                {CHART_GROUP_9_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {cg[option.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Chart type="area" data={chartData} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="visitors"
              name={cg.chartGroup9SeriesVisitors}
              stroke="hsl(var(--brand))"
              fill="hsl(var(--brand))"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="purchases"
              name={cg.chartGroup9SeriesPurchases}
              stroke="hsl(var(--info))"
              fill="hsl(var(--info))"
              fillOpacity={0.2}
            />
          </Chart>
        </div>
      </div>
    </section>
  );
}
