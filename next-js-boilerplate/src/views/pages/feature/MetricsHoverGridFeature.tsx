"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  {
    valueKey: "feature274Stat1Value",
    labelKey: "feature274Stat1Label",
    bodyKey: "feature274Stat1Body",
  },
  {
    valueKey: "feature274Stat2Value",
    labelKey: "feature274Stat2Label",
    bodyKey: "feature274Stat2Body",
  },
  {
    valueKey: "feature274Stat3Value",
    labelKey: "feature274Stat3Label",
    bodyKey: "feature274Stat3Body",
  },
  {
    valueKey: "feature274Stat4Value",
    labelKey: "feature274Stat4Label",
    bodyKey: "feature274Stat4Body",
  },
] as const;

export function MetricsHoverGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature274Heading}
          </h2>
          <p className="text-muted">{f.feature274Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="border-border bg-surface group relative overflow-hidden rounded-lg border p-6"
            >
              <div
                className="bg-brand/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-1.5">
                <span className="text-fg text-4xl font-semibold tracking-tight tabular-nums">
                  {f[stat.valueKey]}
                </span>
                <span className="text-fg text-sm font-medium">
                  {f[stat.labelKey]}
                </span>
                <p className="text-muted text-sm leading-relaxed">
                  {f[stat.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
