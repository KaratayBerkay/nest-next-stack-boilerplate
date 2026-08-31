"use client";

import { IconChartBar, IconCloud, IconLock } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS: { id: string; icon: Icon; titleKey: string; bodyKey: string }[] = [
  { id: "insights", icon: IconChartBar, titleKey: "feature168Card1Title", bodyKey: "feature168Card1Body" },
  { id: "cloud", icon: IconCloud, titleKey: "feature168Card2Title", bodyKey: "feature168Card2Body" },
  { id: "secure", icon: IconLock, titleKey: "feature168Card3Title", bodyKey: "feature168Card3Body" },
];

export function FramedMediaRailFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature168Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature168Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.id} className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-5">
              <div className="border-border bg-bg flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed">
                <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
                  <card.icon size={22} aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-fg text-base font-semibold">{f[card.titleKey]}</h3>
              <p className="text-muted text-sm leading-relaxed">{f[card.bodyKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
