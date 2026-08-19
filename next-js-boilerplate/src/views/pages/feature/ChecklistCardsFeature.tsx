"use client";

import {
  IconCheck,
  IconGitMerge,
  IconHeadset,
  IconRocket,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface ChecklistCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
  checkKeys: readonly [string, string, string];
}

const FEATURE_203_CARDS: ChecklistCard[] = [
  {
    id: "onboarding",
    icon: IconRocket,
    titleKey: "feature203Card1Title",
    bodyKey: "feature203Card1Body",
    checkKeys: [
      "feature203Card1Check1",
      "feature203Card1Check2",
      "feature203Card1Check3",
    ],
  },
  {
    id: "operations",
    icon: IconGitMerge,
    titleKey: "feature203Card2Title",
    bodyKey: "feature203Card2Body",
    checkKeys: [
      "feature203Card2Check1",
      "feature203Card2Check2",
      "feature203Card2Check3",
    ],
  },
  {
    id: "growth",
    icon: IconTrendingUp,
    titleKey: "feature203Card3Title",
    bodyKey: "feature203Card3Body",
    checkKeys: [
      "feature203Card3Check1",
      "feature203Card3Check2",
      "feature203Card3Check3",
    ],
  },
  {
    id: "support",
    icon: IconHeadset,
    titleKey: "feature203Card4Title",
    bodyKey: "feature203Card4Body",
    checkKeys: [
      "feature203Card4Check1",
      "feature203Card4Check2",
      "feature203Card4Check3",
    ],
  },
];

export function ChecklistCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURE_203_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <div className="flex items-center gap-3">
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <card.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
              </div>
              <p className="text-muted text-sm">{f[card.bodyKey]}</p>
              <ul className="border-border flex flex-col gap-2.5 border-t pt-4">
                {card.checkKeys.map((checkKey) => (
                  <li key={checkKey} className="flex items-center gap-2.5">
                    <span className="bg-brand/10 text-brand flex size-5 shrink-0 items-center justify-center rounded-full">
                      <IconCheck size={12} aria-hidden="true" />
                    </span>
                    <span className="text-muted text-sm">{f[checkKey]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
