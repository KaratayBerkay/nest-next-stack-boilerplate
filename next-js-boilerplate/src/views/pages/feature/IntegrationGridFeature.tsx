"use client";

import {
  IconBrandDribbble,
  IconClipboardList,
  IconCurrencyDollar,
  IconFrame,
  IconNotebook,
  IconTriangle,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARD_CLASS =
  "border-border bg-surface flex items-start gap-4 rounded-lg border p-6" as const;
const LOGO_CLASS =
  "border-border bg-surface-hover flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border" as const;

const CARDS = [
  {
    titleKey: "feature44Card1Title",
    bodyKey: "feature44Card1Body",
    Icon: IconFrame,
  },
  {
    titleKey: "feature44Card2Title",
    bodyKey: "feature44Card2Body",
    Icon: IconTriangle,
  },
  {
    titleKey: "feature44Card3Title",
    bodyKey: "feature44Card3Body",
    Icon: IconClipboardList,
  },
  {
    titleKey: "feature44Card4Title",
    bodyKey: "feature44Card4Body",
    Icon: IconNotebook,
  },
  {
    titleKey: "feature44Card5Title",
    bodyKey: "feature44Card5Body",
    Icon: IconCurrencyDollar,
  },
  {
    titleKey: "feature44Card6Title",
    bodyKey: "feature44Card6Body",
    Icon: IconBrandDribbble,
  },
] as const;

export function IntegrationGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature44Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed lg:text-lg">
            {f.feature44Deck}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.titleKey} className={CARD_CLASS}>
              <div className={LOGO_CLASS}>
                <card.Icon size={22} className="text-fg" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
