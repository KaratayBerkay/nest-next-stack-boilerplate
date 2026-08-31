"use client";

import {
  IconArrowRight,
  IconChartInfographic,
  IconPlugConnected,
  IconSettings,
  IconShieldLock,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface UtilityCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
}

const UTILITY_CARDS: UtilityCard[] = [
  {
    id: "automation",
    icon: IconSettings,
    titleKey: "feature21Card1Title",
    bodyKey: "feature21Card1Body",
    linkKey: "feature21Card1Link",
  },
  {
    id: "integrations",
    icon: IconPlugConnected,
    titleKey: "feature21Card2Title",
    bodyKey: "feature21Card2Body",
    linkKey: "feature21Card2Link",
  },
  {
    id: "security",
    icon: IconShieldLock,
    titleKey: "feature21Card3Title",
    bodyKey: "feature21Card3Body",
    linkKey: "feature21Card3Link",
  },
  {
    id: "reporting",
    icon: IconChartInfographic,
    titleKey: "feature21Card4Title",
    bodyKey: "feature21Card4Body",
    linkKey: "feature21Card4Link",
  },
];

export function TwoColUtilityCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature21Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature21Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {UTILITY_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                <card.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
              <span className="text-brand mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                {f[card.linkKey]}
                <IconArrowRight size={14} aria-hidden="true" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
