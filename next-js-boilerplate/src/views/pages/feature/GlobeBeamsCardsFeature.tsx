"use client";

import {
  IconGlobe,
  IconHeadset,
  IconPuzzle,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface GlobeCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const CARDS: GlobeCard[] = [
  {
    id: "edge",
    icon: IconGlobe,
    titleKey: "feature251Card1Title",
    bodyKey: "feature251Card1Body",
  },
  {
    id: "localization",
    icon: IconPuzzle,
    titleKey: "feature251Card2Title",
    bodyKey: "feature251Card2Body",
  },
  {
    id: "compliance",
    icon: IconShieldCheck,
    titleKey: "feature251Card3Title",
    bodyKey: "feature251Card3Body",
  },
  {
    id: "support",
    icon: IconHeadset,
    titleKey: "feature251Card4Title",
    bodyKey: "feature251Card4Body",
  },
];

export function GlobeBeamsCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature251Heading}
          </h2>
          <p className="text-muted">{f.feature251Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, index) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              {index === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="border-brand/30 relative size-40 rounded-full border-2">
                    <span
                      className="bg-brand absolute top-8 left-8 size-3 rounded-full"
                      aria-hidden="true"
                    />
                    <span
                      className="bg-brand/40 absolute top-8 left-8 h-px w-20 origin-left rotate-45"
                      aria-hidden="true"
                    />
                    <span
                      className="bg-brand/40 absolute top-8 left-8 h-px w-20 origin-left -rotate-45"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-muted text-center text-sm">
                    {f.feature251GlobeCaption}
                  </p>
                </div>
              ) : null}
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-md">
                <card.icon size={20} aria-hidden="true" />
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
