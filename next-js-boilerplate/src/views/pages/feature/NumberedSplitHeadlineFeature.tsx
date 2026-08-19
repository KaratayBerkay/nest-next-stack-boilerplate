"use client";

import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconPlayerPlay,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface NumberedCard {
  id: string;
  number: number;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const NUMBERED_CARDS: NumberedCard[] = [
  {
    id: "setup",
    number: 1,
    icon: IconCheck,
    titleKey: "feature231Card1Title",
    bodyKey: "feature231Card1Body",
  },
  {
    id: "schedule",
    number: 2,
    icon: IconCalendar,
    titleKey: "feature231Card2Title",
    bodyKey: "feature231Card2Body",
  },
  {
    id: "launch",
    number: 3,
    icon: IconPlayerPlay,
    titleKey: "feature231Card3Title",
    bodyKey: "feature231Card3Body",
  },
  {
    id: "scale",
    number: 4,
    icon: IconArrowRight,
    titleKey: "feature231Card4Title",
    bodyKey: "feature231Card4Body",
  },
];

export function NumberedSplitHeadlineFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <span className="text-brand text-sm font-semibold tracking-widest uppercase">
              {f.feature231Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature231Heading}
            </h2>
          </div>
          <p className="text-muted leading-relaxed lg:pt-5">
            {f.feature231Intro}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {NUMBERED_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface rounded-lg border p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="bg-brand text-brand-fg flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {String(card.number).padStart(2, "0")}
                </span>
                <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-lg">
                  <card.icon size={20} aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-fg mt-5 text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
