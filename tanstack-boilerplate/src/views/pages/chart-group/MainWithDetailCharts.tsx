"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

interface ChartGroup2Datum {
  monthKey: string;
  totalRevenue: number;
  newCustomers: number;
  churn: number;
  avgOrder: number;
}

interface ChartGroup2Card {
  titleKey: string;
  seriesKey: string;
  value: string;
  dataKey: "newCustomers" | "churn" | "avgOrder";
  type: "bar" | "line";
  color: string;
}

const CHART_GROUP_2_DATA: ChartGroup2Datum[] = [
  {
    monthKey: "chartGroup2Month1",
    totalRevenue: 8200,
    newCustomers: 120,
    churn: 5.2,
    avgOrder: 68,
  },
  {
    monthKey: "chartGroup2Month2",
    totalRevenue: 7600,
    newCustomers: 145,
    churn: 4.9,
    avgOrder: 71,
  },
  {
    monthKey: "chartGroup2Month3",
    totalRevenue: 9100,
    newCustomers: 132,
    churn: 5.1,
    avgOrder: 69,
  },
  {
    monthKey: "chartGroup2Month4",
    totalRevenue: 8800,
    newCustomers: 168,
    churn: 4.6,
    avgOrder: 74,
  },
  {
    monthKey: "chartGroup2Month5",
    totalRevenue: 10400,
    newCustomers: 190,
    churn: 4.3,
    avgOrder: 77,
  },
  {
    monthKey: "chartGroup2Month6",
    totalRevenue: 11200,
    newCustomers: 178,
    churn: 4.5,
    avgOrder: 76,
  },
  {
    monthKey: "chartGroup2Month7",
    totalRevenue: 10900,
    newCustomers: 205,
    churn: 4.1,
    avgOrder: 79,
  },
  {
    monthKey: "chartGroup2Month8",
    totalRevenue: 11800,
    newCustomers: 224,
    churn: 3.8,
    avgOrder: 82,
  },
  {
    monthKey: "chartGroup2Month9",
    totalRevenue: 12500,
    newCustomers: 210,
    churn: 4.0,
    avgOrder: 81,
  },
  {
    monthKey: "chartGroup2Month10",
    totalRevenue: 12100,
    newCustomers: 245,
    churn: 3.6,
    avgOrder: 85,
  },
  {
    monthKey: "chartGroup2Month11",
    totalRevenue: 13600,
    newCustomers: 268,
    churn: 3.4,
    avgOrder: 88,
  },
  {
    monthKey: "chartGroup2Month12",
    totalRevenue: 15200,
    newCustomers: 290,
    churn: 3.1,
    avgOrder: 92,
  },
];

const CHART_GROUP_2_CARDS: ChartGroup2Card[] = [
  {
    titleKey: "chartGroup2Card2Title",
    seriesKey: "chartGroup2Series2",
    value: "2,480",
    dataKey: "newCustomers",
    type: "bar",
    color: "var(--brand)",
  },
  {
    titleKey: "chartGroup2Card3Title",
    seriesKey: "chartGroup2Series3",
    value: "3.1%",
    dataKey: "churn",
    type: "line",
    color: "var(--info)",
  },
  {
    titleKey: "chartGroup2Card4Title",
    seriesKey: "chartGroup2Series4",
    value: "$92",
    dataKey: "avgOrder",
    type: "line",
    color: "var(--success)",
  },
];

export function MainWithDetailCharts() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const chartData = CHART_GROUP_2_DATA.map((datum) => ({
    month: cg[datum.monthKey],
    totalRevenue: datum.totalRevenue,
    newCustomers: datum.newCustomers,
    churn: datum.churn,
    avgOrder: datum.avgOrder,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cg.chartGroup2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cg.chartGroup2Description}
          </Typography>
        </div>
        <article className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Typography variant="h5">{cg.chartGroup2Card1Title}</Typography>
            <span className="text-fg text-3xl font-semibold tracking-tight">
              $131,400
            </span>
          </div>
          <Chart type="area" data={chartData} height={300}>
            <defs>
              <linearGradient
                id="chartGroup2RevenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="totalRevenue"
              name={cg.chartGroup2Series1}
              stroke="var(--brand)"
              fill="url(#chartGroup2RevenueGradient)"
            />
          </Chart>
        </article>
        <div className="grid gap-6 md:grid-cols-3">
          {CHART_GROUP_2_CARDS.map((card) => (
            <article
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6"
            >
              <div className="flex flex-col gap-1">
                <Typography variant="h5">{cg[card.titleKey]}</Typography>
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {card.value}
                </span>
              </div>
              <Chart type={card.type} data={chartData} height={96}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                {card.type === "bar" ? (
                  <Bar
                    dataKey={card.dataKey}
                    name={cg[card.seriesKey]}
                    fill={card.color}
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey={card.dataKey}
                    name={cg[card.seriesKey]}
                    stroke={card.color}
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </Chart>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
