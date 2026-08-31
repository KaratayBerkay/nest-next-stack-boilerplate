"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  { valueKey: "feature120Stat1Value", labelKey: "feature120Stat1Label" },
  { valueKey: "feature120Stat2Value", labelKey: "feature120Stat2Label" },
  { valueKey: "feature120Stat3Value", labelKey: "feature120Stat3Label" },
  { valueKey: "feature120Stat4Value", labelKey: "feature120Stat4Label" },
] as const;

export function ProofStatStripFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-12">
          <h2 className="text-fg max-w-xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature120Heading}
          </h2>
          <p className="text-muted max-w-lg leading-relaxed lg:justify-self-end">
            {f.feature120Intro}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="border-border bg-surface flex flex-col items-center gap-1 rounded-lg border p-8 text-center shadow-sm"
            >
              <span className="text-fg text-3xl font-semibold tracking-tight tabular-nums">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
