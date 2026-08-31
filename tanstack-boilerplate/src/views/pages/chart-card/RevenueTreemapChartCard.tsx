"use client";

import { Cell, ResponsiveContainer, Treemap } from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface CategoryDatum {
  nameKey: string;
  value: number;
}

const PALETTE = [
  "var(--brand)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--error)",
  "var(--muted)",
] as const;

const CATEGORY_DATA: CategoryDatum[] = [
  { nameKey: "chartCard22Category1", value: 42000 },
  { nameKey: "chartCard22Category2", value: 28600 },
  { nameKey: "chartCard22Category3", value: 19400 },
  { nameKey: "chartCard22Category4", value: 14100 },
  { nameKey: "chartCard22Category5", value: 9200 },
  { nameKey: "chartCard22Category6", value: 5800 },
];

export function RevenueTreemapChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = CATEGORY_DATA.map((item) => ({
    name: c[item.nameKey],
    value: item.value,
  }));

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard22Title}</Typography>
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="value"
              nameKey="name"
              stroke="var(--bg)"
              fill="var(--brand)"
              isAnimationActive={false}
            >
              {CATEGORY_DATA.map((item, index) => (
                <Cell key={item.nameKey} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {CATEGORY_DATA.map((item, index) => (
            <div key={item.nameKey} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                aria-hidden="true"
              />
              <span className="text-muted truncate">{c[item.nameKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
