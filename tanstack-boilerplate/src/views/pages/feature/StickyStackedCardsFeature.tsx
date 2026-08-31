"use client";

import { IconBolt, IconChartLine, IconGitMerge } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface FeatureItem {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const ITEMS: FeatureItem[] = [
  {
    id: "plan",
    icon: IconGitMerge,
    titleKey: "feature135Item1Title",
    bodyKey: "feature135Item1Body",
  },
  {
    id: "automate",
    icon: IconBolt,
    titleKey: "feature135Item2Title",
    bodyKey: "feature135Item2Body",
  },
  {
    id: "measure",
    icon: IconChartLine,
    titleKey: "feature135Item3Title",
    bodyKey: "feature135Item3Body",
  },
];

export function StickyStackedCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-24 lg:self-start">
            <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {f.feature135Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature135Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature135Intro}</p>
            <Button>{f.feature135ButtonLabel}</Button>
          </div>
          <div className="flex flex-col gap-6">
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="border-border bg-surface flex items-start gap-4 rounded-lg border p-6"
              >
                <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-md">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[item.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[item.bodyKey]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
