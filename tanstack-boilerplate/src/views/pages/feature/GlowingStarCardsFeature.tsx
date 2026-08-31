"use client";

import { IconStar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    id: "performance",
    titleKey: "feature287Card1Title",
    bodyKey: "feature287Card1Body",
  },
  {
    id: "clarity",
    titleKey: "feature287Card2Title",
    bodyKey: "feature287Card2Body",
  },
  {
    id: "dependability",
    titleKey: "feature287Card3Title",
    bodyKey: "feature287Card3Body",
  },
  {
    id: "security",
    titleKey: "feature287Card4Title",
    bodyKey: "feature287Card4Body",
  },
  {
    id: "flexibility",
    titleKey: "feature287Card5Title",
    bodyKey: "feature287Card5Body",
  },
  {
    id: "support",
    titleKey: "feature287Card6Title",
    bodyKey: "feature287Card6Body",
  },
] as const;

export function GlowingStarCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge pill>{f.feature287Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature287Heading}
          </h2>
          <p className="text-muted">{f.feature287Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface before:via-brand/40 relative flex flex-col gap-4 overflow-hidden rounded-lg border p-6 before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent"
            >
              <span className="bg-brand/5 border-brand/20 text-brand flex size-11 shrink-0 items-center justify-center rounded-full border">
                <IconStar size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
