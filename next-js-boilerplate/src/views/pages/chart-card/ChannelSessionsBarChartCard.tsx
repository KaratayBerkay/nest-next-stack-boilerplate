"use client";

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

interface ChannelDatum {
  labelKey: string;
  sessions: number;
}

const CHANNEL_DATA: ChannelDatum[] = [
  { labelKey: "chartCard3Channel1", sessions: 4820 },
  { labelKey: "chartCard3Channel2", sessions: 3640 },
  { labelKey: "chartCard3Channel3", sessions: 2210 },
  { labelKey: "chartCard3Channel4", sessions: 1870 },
  { labelKey: "chartCard3Channel5", sessions: 990 },
];

export function ChannelSessionsBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = CHANNEL_DATA.map((item) => ({
    label: c[item.labelKey],
    sessions: item.sessions,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard3Title}</Typography>
        <div className="mt-5">
          <Chart type="bar" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="sessions"
              name={c.chartCard3SeriesLabel}
              fill="var(--brand)"
              radius={[6, 6, 0, 0]}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
