"use client";

import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";
import { formatCountValue, useCountUp } from "./useCountUp";

const HERO_TARGET = 2400000;

interface RailStat {
  valueKey: string;
  labelKey: string;
}

const RAIL_STATS: RailStat[] = [
  { valueKey: "stats4Rail1Value", labelKey: "stats4Rail1Label" },
  { valueKey: "stats4Rail2Value", labelKey: "stats4Rail2Label" },
  { valueKey: "stats4Rail3Value", labelKey: "stats4Rail3Label" },
  { valueKey: "stats4Rail4Value", labelKey: "stats4Rail4Label" },
];

export function HeroStatWithRailStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;
  const heroValue = useCountUp(HERO_TARGET, 1800);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {sk.stats4Eyebrow}
        </span>
        <p className="text-fg text-6xl font-bold tracking-tight tabular-nums lg:text-8xl">
          {formatCountValue(heroValue, 0)}
          <span className="text-brand">+</span>
        </p>
        <p className="text-fg text-lg font-semibold">{sk.stats4HeroLabel}</p>
        <p className="text-muted max-w-xl leading-relaxed">
          {sk.stats4HeroDescription}
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col rounded-2xl border sm:flex-row">
          {RAIL_STATS.map((stat, index) => (
            <div key={stat.valueKey} className="flex flex-1 items-stretch">
              <div
                className={
                  index === 0
                    ? "flex flex-1 flex-col items-center gap-1 px-6 py-6 text-center"
                    : "border-border flex flex-1 flex-col items-center gap-1 border-t px-6 py-6 text-center sm:border-t-0"
                }
              >
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {sk[stat.valueKey]}
                </span>
                <span className="text-muted text-sm">{sk[stat.labelKey]}</span>
              </div>
              {index === RAIL_STATS.length - 1 ? null : (
                <Separator
                  orientation="vertical"
                  className="hidden sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
