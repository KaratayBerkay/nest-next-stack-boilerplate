"use client";

import {
  IconCpu,
  IconDatabase,
  IconServer,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature237Card1Title",
    bodyKey: "feature237Card1Body",
    valueKey: "feature237Card1MetricValue",
    labelKey: "feature237Card1MetricLabel",
    icon: IconDatabase,
  },
  {
    titleKey: "feature237Card2Title",
    bodyKey: "feature237Card2Body",
    valueKey: "feature237Card2MetricValue",
    labelKey: "feature237Card2MetricLabel",
    icon: IconCpu,
  },
  {
    titleKey: "feature237Card3Title",
    bodyKey: "feature237Card3Body",
    valueKey: "feature237Card3MetricValue",
    labelKey: "feature237Card3MetricLabel",
    icon: IconServer,
  },
  {
    titleKey: "feature237Card4Title",
    bodyKey: "feature237Card4Body",
    valueKey: "feature237Card4MetricValue",
    labelKey: "feature237Card4MetricLabel",
    icon: IconShieldCheck,
  },
] as const;

export function DenseMetricsCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature237Heading}
          </h2>
          <p className="text-muted">{f.feature237Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <div className="flex items-center gap-3">
                <span className="border-border bg-bg text-fg inline-flex size-9 items-center justify-center rounded-md border">
                  <card.icon size={18} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-sm font-semibold">
                  {f[card.titleKey]}
                </h3>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
              <div className="border-border mt-auto border-t pt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-fg text-2xl font-semibold tracking-tight tabular-nums">
                    {f[card.valueKey]}
                  </span>
                  <span className="text-muted text-right text-xs">
                    {f[card.labelKey]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
