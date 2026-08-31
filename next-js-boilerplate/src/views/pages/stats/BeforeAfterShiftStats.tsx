"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";

interface ShiftRow {
  id: string;
  metricKey: string;
  beforeKey: string;
  afterKey: string;
  deltaKey: string;
}

const ROWS: ShiftRow[] = [
  {
    id: "row-1",
    metricKey: "stats6Row1Metric",
    beforeKey: "stats6Row1Before",
    afterKey: "stats6Row1After",
    deltaKey: "stats6Row1Delta",
  },
  {
    id: "row-2",
    metricKey: "stats6Row2Metric",
    beforeKey: "stats6Row2Before",
    afterKey: "stats6Row2After",
    deltaKey: "stats6Row2Delta",
  },
  {
    id: "row-3",
    metricKey: "stats6Row3Metric",
    beforeKey: "stats6Row3Before",
    afterKey: "stats6Row3After",
    deltaKey: "stats6Row3Delta",
  },
  {
    id: "row-4",
    metricKey: "stats6Row4Metric",
    beforeKey: "stats6Row4Before",
    afterKey: "stats6Row4After",
    deltaKey: "stats6Row4Delta",
  },
];

export function BeforeAfterShiftStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats6Heading}
          </h2>
          <p className="text-muted max-w-xl leading-relaxed">
            {sk.stats6Intro}
          </p>
        </div>
        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          <div className="border-border grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-3 sm:grid-cols-[1fr_1fr_auto_1fr]">
            <span className="text-muted text-xs font-semibold tracking-wider uppercase">
              {sk.stats6ColumnMetricLabel}
            </span>
            <span className="text-muted hidden text-xs font-semibold tracking-wider uppercase sm:block">
              {sk.stats6ColumnBeforeLabel}
            </span>
            <span aria-hidden="true" />
            <span className="text-muted text-right text-xs font-semibold tracking-wider uppercase sm:text-left">
              {sk.stats6ColumnAfterLabel}
            </span>
          </div>
          <ul>
            {ROWS.map((row) => (
              <li
                key={row.id}
                className="border-border grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-6 py-5 last:border-b-0 sm:grid-cols-[1fr_1fr_auto_1fr]"
              >
                <span className="text-fg text-sm font-semibold">
                  {sk[row.metricKey]}
                </span>
                <span className="text-muted hidden text-sm line-through decoration-2 sm:block">
                  {sk[row.beforeKey]}
                </span>
                <IconArrowRight
                  size={16}
                  aria-hidden="true"
                  className="text-muted hidden sm:block"
                />
                <span className="flex items-center justify-end gap-2 sm:justify-start">
                  <span className="text-fg text-lg font-semibold tracking-tight">
                    {sk[row.afterKey]}
                  </span>
                  <Badge variant="success" size="sm">
                    {sk[row.deltaKey]}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-muted text-center text-xs sm:hidden">
          {sk.stats6MobileHint}
        </p>
      </div>
    </section>
  );
}
