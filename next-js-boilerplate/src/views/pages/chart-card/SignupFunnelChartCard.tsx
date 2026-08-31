"use client";

import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface StageDatum {
  nameKey: string;
  value: number;
  fill: string;
}

const FUNNEL_DATA: StageDatum[] = [
  { nameKey: "chartCard21Stage1", value: 18400, fill: "var(--brand)" },
  { nameKey: "chartCard21Stage2", value: 11200, fill: "var(--info)" },
  { nameKey: "chartCard21Stage3", value: 8600, fill: "var(--success)" },
  { nameKey: "chartCard21Stage4", value: 5100, fill: "var(--warning)" },
  { nameKey: "chartCard21Stage5", value: 2800, fill: "var(--brand)" },
];

export function SignupFunnelChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = FUNNEL_DATA.map((stage) => ({
    name: c[stage.nameKey],
    value: stage.value,
    fill: stage.fill,
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard21Title}</Typography>
        <div className="mt-4 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={data} isAnimationActive={false}>
                <LabelList
                  dataKey="name"
                  position="right"
                  fill="var(--fg)"
                  stroke="none"
                  fontSize={12}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
