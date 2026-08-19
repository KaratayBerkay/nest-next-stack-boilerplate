"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STAT_CARDS = [
  {
    titleKey: "feature222Card1Title",
    statValueKey: "feature222Card1StatValue",
    statLabelKey: "feature222Card1StatLabel",
    altKey: "feature222Card1ImageAlt",
    src: "https://picsum.photos/seed/feature222-1/800/600",
  },
  {
    titleKey: "feature222Card2Title",
    statValueKey: "feature222Card2StatValue",
    statLabelKey: "feature222Card2StatLabel",
    altKey: "feature222Card2ImageAlt",
    src: "https://picsum.photos/seed/feature222-2/800/600",
  },
  {
    titleKey: "feature222Card3Title",
    statValueKey: "feature222Card3StatValue",
    statLabelKey: "feature222Card3StatLabel",
    altKey: "feature222Card3ImageAlt",
    src: "https://picsum.photos/seed/feature222-3/800/600",
  },
  {
    titleKey: "feature222Card4Title",
    statValueKey: "feature222Card4StatValue",
    statLabelKey: "feature222Card4StatLabel",
    altKey: "feature222Card4ImageAlt",
    src: "https://picsum.photos/seed/feature222-4/800/600",
  },
  {
    titleKey: "feature222Card5Title",
    statValueKey: "feature222Card5StatValue",
    statLabelKey: "feature222Card5StatLabel",
    altKey: "feature222Card5ImageAlt",
    src: "https://picsum.photos/seed/feature222-5/800/600",
  },
  {
    titleKey: "feature222Card6Title",
    statValueKey: "feature222Card6StatValue",
    statLabelKey: "feature222Card6StatLabel",
    altKey: "feature222Card6ImageAlt",
    src: "https://picsum.photos/seed/feature222-6/800/600",
  },
] as const;

export function ImageStatCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature222Heading}
          </h2>
          <p className="text-muted">{f.feature222Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface overflow-hidden rounded-lg border"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 p-5">
                <h3 className="text-fg text-lg font-semibold">
                  {f[card.titleKey]}
                </h3>
                <div className="border-border flex items-baseline gap-2 border-t pt-4">
                  <span className="text-brand text-2xl font-semibold">
                    {f[card.statValueKey]}
                  </span>
                  <span className="text-muted text-sm">
                    {f[card.statLabelKey]}
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
