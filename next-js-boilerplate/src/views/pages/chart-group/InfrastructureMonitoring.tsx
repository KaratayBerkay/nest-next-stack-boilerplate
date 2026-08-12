"use client";

import {
  IconCircuitBattery,
  IconCpu,
  IconDatabase,
  IconNetwork,
} from "@tabler/icons-react";
import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  Bar,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Icon } from "@tabler/icons-react";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

interface ChartGroup10Stat {
  icon: Icon;
  labelKey: string;
  valueKey: string;
  toneClass: string;
}

interface ChartGroup10MetricPoint {
  labelKey: string;
  cpu: number;
  memory: number;
  network: number;
}

const CHART_GROUP_10_STATS: ChartGroup10Stat[] = [
  {
    icon: IconCpu,
    labelKey: "chartGroup10Stat1Label",
    valueKey: "chartGroup10Stat1Value",
    toneClass: "text-info",
  },
  {
    icon: IconCircuitBattery,
    labelKey: "chartGroup10Stat2Label",
    valueKey: "chartGroup10Stat2Value",
    toneClass: "text-success",
  },
  {
    icon: IconNetwork,
    labelKey: "chartGroup10Stat3Label",
    valueKey: "chartGroup10Stat3Value",
    toneClass: "text-success",
  },
  {
    icon: IconDatabase,
    labelKey: "chartGroup10Stat4Label",
    valueKey: "chartGroup10Stat4Value",
    toneClass: "text-warning",
  },
];

const CHART_GROUP_10_METRICS: ChartGroup10MetricPoint[] = [
  { labelKey: "chartGroup10Time1", cpu: 22, memory: 41, network: 0.4 },
  { labelKey: "chartGroup10Time2", cpu: 18, memory: 39, network: 0.3 },
  { labelKey: "chartGroup10Time3", cpu: 25, memory: 42, network: 0.6 },
  { labelKey: "chartGroup10Time4", cpu: 58, memory: 48, network: 1.6 },
  { labelKey: "chartGroup10Time5", cpu: 64, memory: 55, network: 1.9 },
  { labelKey: "chartGroup10Time6", cpu: 71, memory: 61, network: 2.2 },
  { labelKey: "chartGroup10Time7", cpu: 55, memory: 58, network: 1.5 },
  { labelKey: "chartGroup10Time8", cpu: 38, memory: 49, network: 0.8 },
];

export function InfrastructureMonitoring() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const metricData = CHART_GROUP_10_METRICS.map((p) => ({
    label: cg[p.labelKey],
    cpu: p.cpu,
    memory: p.memory,
    network: p.network,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup10Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup10Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHART_GROUP_10_STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="border-border bg-surface flex items-center gap-4 rounded-3xl border p-5"
            >
              <div className="border-border bg-surface flex size-11 shrink-0 items-center justify-center rounded-xl border">
                <stat.icon
                  size={20}
                  className={stat.toneClass}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className={`text-xl font-semibold tracking-tight ${stat.toneClass}`}
                >
                  {cg[stat.valueKey]}
                </span>
                <span className="text-muted text-xs">{cg[stat.labelKey]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 lg:col-span-2">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup10Card1Title}
            </Typography>
            <Chart type="area" data={metricData} height={260}>
              <defs>
                <linearGradient
                  id="chartGroup10CpuFill"
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
                  id="chartGroup10MemoryFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--info))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--info))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="cpu"
                name={cg.chartGroup10SeriesCpu}
                stroke="hsl(var(--brand))"
                fill="url(#chartGroup10CpuFill)"
              />
              <Area
                type="monotone"
                dataKey="memory"
                name={cg.chartGroup10SeriesMemory}
                stroke="hsl(var(--info))"
                fill="url(#chartGroup10MemoryFill)"
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup10Card2Title}
            </Typography>
            <Chart type="bar" data={metricData} height={260}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="network"
                name={cg.chartGroup10SeriesNetwork}
                fill="hsl(var(--success))"
                radius={[6, 6, 0, 0]}
              />
            </Chart>
          </div>
        </div>
      </div>
    </section>
  );
}
