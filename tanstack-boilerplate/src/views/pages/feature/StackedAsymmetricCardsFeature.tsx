"use client";

import { IconBolt, IconChartBar, IconShieldCheck } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS: { id: string; icon: Icon; offset: string; titleKey: string; bodyKey: string }[] = [
  { id: "c1", icon: IconBolt, offset: "sm:-mr-4 sm:mt-0", titleKey: "feature144Card1Title", bodyKey: "feature144Card1Body" },
  { id: "c2", icon: IconChartBar, offset: "sm:mt-6", titleKey: "feature144Card2Title", bodyKey: "feature144Card2Body" },
  { id: "c3", icon: IconShieldCheck, offset: "sm:-ml-4 sm:mt-0", titleKey: "feature144Card3Title", bodyKey: "feature144Card3Body" },
];

export function StackedAsymmetricCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature144Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature144Intro}</p>
      </div>
      <div className="mx-auto mt-16 grid max-w-4xl gap-5 px-6 sm:grid-cols-3 lg:px-8">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className={`border-border bg-surface relative z-10 flex flex-col gap-3 rounded-xl border p-6 shadow-md hover:z-20 ${card.offset}`}
          >
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
              <card.icon size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-sm font-semibold">{f[card.titleKey]}</h3>
            <p className="text-muted text-sm leading-relaxed">{f[card.bodyKey]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
