"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

interface MetricRow {
  labelKey: string;
  traditionalValue: string;
  traditionalUnit: string;
  traditionalCaptionKey: string;
  cloudValue: string;
  cloudUnit: string;
  cloudCaptionKey: string;
}

const METRIC_ROWS: MetricRow[] = [
  {
    labelKey: "compare4Row1Label",
    traditionalValue: "95",
    traditionalUnit: "ms",
    traditionalCaptionKey: "compare4Row1TradCaption",
    cloudValue: "12",
    cloudUnit: "ms",
    cloudCaptionKey: "compare4Row1CloudCaption",
  },
  {
    labelKey: "compare4Row2Label",
    traditionalValue: "480",
    traditionalUnit: "ms",
    traditionalCaptionKey: "compare4Row2TradCaption",
    cloudValue: "45",
    cloudUnit: "ms",
    cloudCaptionKey: "compare4Row2CloudCaption",
  },
  {
    labelKey: "compare4Row3Label",
    traditionalValue: "6",
    traditionalUnit: "wk",
    traditionalCaptionKey: "compare4Row3TradCaption",
    cloudValue: "2",
    cloudUnit: "days",
    cloudCaptionKey: "compare4Row3CloudCaption",
  },
  {
    labelKey: "compare4Row4Label",
    traditionalValue: "4",
    traditionalUnit: "days",
    traditionalCaptionKey: "compare4Row4TradCaption",
    cloudValue: "90",
    cloudUnit: "s",
    cloudCaptionKey: "compare4Row4CloudCaption",
  },
  {
    labelKey: "compare4Row5Label",
    traditionalValue: "99.9",
    traditionalUnit: "%",
    traditionalCaptionKey: "compare4Row5TradCaption",
    cloudValue: "99.99",
    cloudUnit: "%",
    cloudCaptionKey: "compare4Row5CloudCaption",
  },
  {
    labelKey: "compare4Row6Label",
    traditionalValue: "$1.2M",
    traditionalUnit: "",
    traditionalCaptionKey: "compare4Row6TradCaption",
    cloudValue: "$0",
    cloudUnit: "",
    cloudCaptionKey: "compare4Row6CloudCaption",
  },
];

const DISCLAIMERS = [
  "compare4Disclaimer1",
  "compare4Disclaimer2",
  "compare4Disclaimer3",
] as const;

export function CloudVsOnSite() {
  const t = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = t.compare;

  return (
    <section className="bg-surface-hover/50 w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compare4Title}
          </Typography>
        </div>
        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs">
          <div className="border-border divide-border grid grid-cols-[1fr_1fr] divide-x border-b">
            <div className="px-6 py-4 lg:px-8">
              <Typography
                variant="overline"
                className="text-xs font-semibold tracking-widest"
              >
                {co.compare4Header1Label}
              </Typography>
            </div>
            <div className="bg-brand/5 px-6 py-4 lg:px-8">
              <Typography
                variant="overline"
                className="text-brand text-xs font-semibold tracking-widest"
              >
                {co.compare4Header2Label}
              </Typography>
            </div>
          </div>
          <div className="divide-border divide-y">
            {METRIC_ROWS.map((row) => (
              <div
                key={row.labelKey}
                className="hover:bg-surface-hover group grid grid-cols-3 items-center gap-4 px-6 py-6 transition-colors lg:px-8"
              >
                <Typography variant="body" className="font-semibold">
                  {co[row.labelKey]}
                </Typography>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <Typography
                      variant="body"
                      className="text-2xl font-semibold tracking-tight md:text-4xl"
                    >
                      {row.traditionalValue}
                    </Typography>
                    {row.traditionalUnit && (
                      <sup className="text-muted text-sm font-medium">
                        {row.traditionalUnit}
                      </sup>
                    )}
                  </div>
                  <Typography variant="caption" className="text-xs">
                    {co[row.traditionalCaptionKey]}
                  </Typography>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <Typography
                      variant="body"
                      className="group-hover:text-brand text-2xl font-semibold tracking-tight transition-colors md:text-4xl"
                    >
                      {row.cloudValue}
                    </Typography>
                    {row.cloudUnit && (
                      <sup className="text-muted text-sm font-medium">
                        {row.cloudUnit}
                      </sup>
                    )}
                  </div>
                  <Typography variant="caption" className="text-xs">
                    {co[row.cloudCaptionKey]}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <div className="border-border flex flex-col gap-6 border-t p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="flex flex-col gap-1.5">
              {DISCLAIMERS.map((disclaimerKey, index) => (
                <Typography
                  key={disclaimerKey}
                  variant="caption"
                  className="text-xs"
                >
                  {["*", "†", "‡"][index]} {co[disclaimerKey]}
                </Typography>
              ))}
            </div>
            <button
              type="button"
              className="bg-brand text-brand-fg hover:bg-brand/90 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium shadow-xs transition-colors"
            >
              {co.compare4Cta}
              <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
