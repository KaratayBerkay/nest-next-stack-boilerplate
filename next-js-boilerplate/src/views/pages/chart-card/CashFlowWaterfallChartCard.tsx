"use client";

import { Cell } from "recharts";
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

type StepTone = "total" | "positive" | "negative";

interface StepDatum {
  nameKey: string;
  base: number;
  delta: number;
  tone: StepTone;
}

const TONE_COLOR: Record<StepTone, string> = {
  total: "var(--brand)",
  positive: "var(--success)",
  negative: "var(--error)",
};

const WATERFALL_DATA: StepDatum[] = [
  { nameKey: "chartCard15Step1", base: 0, delta: 42, tone: "total" },
  { nameKey: "chartCard15Step2", base: 42, delta: 28, tone: "positive" },
  { nameKey: "chartCard15Step3", base: 54, delta: 16, tone: "negative" },
  { nameKey: "chartCard15Step4", base: 43, delta: 11, tone: "negative" },
  { nameKey: "chartCard15Step5", base: 37, delta: 6, tone: "negative" },
  { nameKey: "chartCard15Step6", base: 0, delta: 37, tone: "total" },
];

export function CashFlowWaterfallChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = WATERFALL_DATA.map((item) => ({
    name: c[item.nameKey],
    base: item.base,
    delta: item.delta,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard15Title}</Typography>
        <div className="mt-5">
          <Chart type="bar" data={data} height={260}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="base"
              stackId="bridge"
              fill="transparent"
              isAnimationActive={false}
            />
            <Bar dataKey="delta" stackId="bridge" radius={[3, 3, 3, 3]}>
              {WATERFALL_DATA.map((step) => (
                <Cell key={step.nameKey} fill={TONE_COLOR[step.tone]} />
              ))}
            </Bar>
          </Chart>
        </div>
      </div>
    </div>
  );
}
