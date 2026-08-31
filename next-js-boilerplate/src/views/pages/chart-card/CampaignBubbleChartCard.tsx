"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface CampaignPoint {
  reach: number;
  engagement: number;
  budget: number;
}

const SEARCH_DATA: CampaignPoint[] = [
  { reach: 32, engagement: 4.2, budget: 180 },
  { reach: 48, engagement: 3.6, budget: 260 },
  { reach: 61, engagement: 5.1, budget: 340 },
];

const SOCIAL_DATA: CampaignPoint[] = [
  { reach: 55, engagement: 6.4, budget: 220 },
  { reach: 71, engagement: 7.2, budget: 300 },
  { reach: 44, engagement: 5.8, budget: 160 },
];

const EMAIL_DATA: CampaignPoint[] = [
  { reach: 24, engagement: 8.6, budget: 90 },
  { reach: 30, engagement: 9.4, budget: 110 },
  { reach: 19, engagement: 7.9, budget: 70 },
];

export function CampaignBubbleChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard24Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard24Channel1}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-info size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard24Channel2}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-success size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard24Channel3}
            </span>
          </div>
        </div>
        <div className="mt-4 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="reach"
                name={c.chartCard24XAxisLabel}
              />
              <YAxis
                type="number"
                dataKey="engagement"
                name={c.chartCard24YAxisLabel}
              />
              <ZAxis type="number" dataKey="budget" range={[80, 500]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name={c.chartCard24Channel1}
                data={SEARCH_DATA}
                fill="var(--brand)"
                fillOpacity={0.7}
              />
              <Scatter
                name={c.chartCard24Channel2}
                data={SOCIAL_DATA}
                fill="var(--info)"
                fillOpacity={0.7}
              />
              <Scatter
                name={c.chartCard24Channel3}
                data={EMAIL_DATA}
                fill="var(--success)"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
