"use client";

import { IconBolt, IconCheck, IconFlare, IconX } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";

interface ComparisonRow {
  labelKey: string;
  leftKey: string;
  rightKey: string;
  withIcons: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    labelKey: "compare1Row1Label",
    leftKey: "compare1Row1Left",
    rightKey: "compare1Row1Right",
    withIcons: false,
  },
  {
    labelKey: "compare1Row2Label",
    leftKey: "compare1Row2Left",
    rightKey: "compare1Row2Right",
    withIcons: false,
  },
  {
    labelKey: "compare1Row3Label",
    leftKey: "compare1Row3Left",
    rightKey: "compare1Row3Right",
    withIcons: false,
  },
  {
    labelKey: "compare1Row4Label",
    leftKey: "compare1Row4Left",
    rightKey: "compare1Row4Right",
    withIcons: true,
  },
  {
    labelKey: "compare1Row5Label",
    leftKey: "compare1Row5Left",
    rightKey: "compare1Row5Right",
    withIcons: true,
  },
  {
    labelKey: "compare1Row6Label",
    leftKey: "compare1Row6Left",
    rightKey: "compare1Row6Right",
    withIcons: true,
  },
];

const GRID_COLUMNS = "grid grid-cols-[1.15fr_1fr_1fr]";

export function TintedFeatureComparison() {
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();
  const t = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = t.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compare1Title}
          </Typography>
        </div>
        <div ref={scrollFadeRef} className="overflow-x-auto">
          <div className="border-border min-w-[720px] overflow-hidden rounded-2xl border shadow-xs">
            <div className={GRID_COLUMNS}>
              <div className="border-border border-b px-6 py-5 lg:px-8" />
              <div className="border-border bg-brand/10 border-b border-l px-6 py-5 lg:px-8">
                <div className="flex items-center gap-3">
                  <span className="bg-surface border-border ring-border flex size-9 items-center justify-center rounded-lg shadow-xs ring-1 ring-inset">
                    <IconBolt size={18} className="text-brand" />
                  </span>
                  <Typography variant="h6">Lumina</Typography>
                </div>
              </div>
              <div className="border-border bg-error/10 border-b border-l px-6 py-5 lg:px-8">
                <div className="flex items-center gap-3">
                  <span className="bg-surface border-border ring-border flex size-9 items-center justify-center rounded-lg shadow-xs ring-1 ring-inset">
                    <IconFlare size={18} className="text-error" />
                  </span>
                  <Typography variant="h6">Veltrix</Typography>
                </div>
              </div>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.labelKey} className={GRID_COLUMNS}>
                <div className="border-border flex items-center border-b px-6 py-5 lg:px-8">
                  <Typography variant="body" className="font-semibold">
                    {co[row.labelKey]}
                  </Typography>
                </div>
                <div className="border-border bg-brand/5 flex items-center gap-2.5 border-b border-l px-6 py-5 lg:px-8">
                  {row.withIcons && (
                    <IconCheck size={18} className="text-brand shrink-0" />
                  )}
                  <Typography variant="body" className="text-fg">
                    {co[row.leftKey]}
                  </Typography>
                </div>
                <div className="border-border bg-error/5 flex items-center gap-2.5 border-b border-l px-6 py-5 lg:px-8">
                  {row.withIcons && (
                    <IconX size={18} className="text-muted shrink-0" />
                  )}
                  <Typography variant="body" className="text-fg">
                    {co[row.rightKey]}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
