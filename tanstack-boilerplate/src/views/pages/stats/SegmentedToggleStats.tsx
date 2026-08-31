"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";

type Segment = "month" | "quarter" | "year" | "allTime";

interface SegmentStat {
  valueKey: string;
  labelKey: string;
}

const SEGMENTS: { id: Segment; labelKey: string }[] = [
  { id: "month", labelKey: "stats8SegmentMonthLabel" },
  { id: "quarter", labelKey: "stats8SegmentQuarterLabel" },
  { id: "year", labelKey: "stats8SegmentYearLabel" },
  { id: "allTime", labelKey: "stats8SegmentAllTimeLabel" },
];

const SEGMENT_STATS: Record<Segment, SegmentStat[]> = {
  month: [
    { valueKey: "stats8MonthStat1Value", labelKey: "stats8MonthStat1Label" },
    { valueKey: "stats8MonthStat2Value", labelKey: "stats8MonthStat2Label" },
    { valueKey: "stats8MonthStat3Value", labelKey: "stats8MonthStat3Label" },
  ],
  quarter: [
    { valueKey: "stats8QuarterStat1Value", labelKey: "stats8QuarterStat1Label" },
    { valueKey: "stats8QuarterStat2Value", labelKey: "stats8QuarterStat2Label" },
    { valueKey: "stats8QuarterStat3Value", labelKey: "stats8QuarterStat3Label" },
  ],
  year: [
    { valueKey: "stats8YearStat1Value", labelKey: "stats8YearStat1Label" },
    { valueKey: "stats8YearStat2Value", labelKey: "stats8YearStat2Label" },
    { valueKey: "stats8YearStat3Value", labelKey: "stats8YearStat3Label" },
  ],
  allTime: [
    { valueKey: "stats8AllTimeStat1Value", labelKey: "stats8AllTimeStat1Label" },
    { valueKey: "stats8AllTimeStat2Value", labelKey: "stats8AllTimeStat2Label" },
    { valueKey: "stats8AllTimeStat3Value", labelKey: "stats8AllTimeStat3Label" },
  ],
};

export function SegmentedToggleStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;
  const [segment, setSegment] = useState<Segment>("month");

  const activeStats = SEGMENT_STATS[segment];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats8Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.stats8Intro}</p>
        </div>
        <ToggleGroup
          type="single"
          value={segment}
          onValueChange={(value) => {
            if (value) setSegment(value as Segment);
          }}
          aria-label={sk.stats8FilterGroupAria}
        >
          {SEGMENTS.map((s) => (
            <ToggleGroupItem key={s.id} value={s.id} size="sm">
              {sk[s.labelKey]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {activeStats.map((stat) => (
            <div
              key={stat.valueKey}
              className="border-border bg-surface flex flex-col items-center gap-1 rounded-2xl border p-8 text-center"
            >
              <span className="text-fg text-4xl font-semibold tracking-tight">
                {sk[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{sk[stat.labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
