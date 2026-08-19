"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature39Card1Title",
    bodyKey: "feature39Card1Body",
    altKey: "feature39Card1ImageAlt",
    src: "https://picsum.photos/seed/feature39-card1/800/600",
  },
  {
    titleKey: "feature39Card2Title",
    bodyKey: "feature39Card2Body",
    altKey: "feature39Card2ImageAlt",
    src: "https://picsum.photos/seed/feature39-card2/800/600",
  },
  {
    titleKey: "feature39Card3Title",
    bodyKey: "feature39Card3Body",
    altKey: "feature39Card3ImageAlt",
    src: "https://picsum.photos/seed/feature39-card3/800/600",
  },
] as const;

export function SimpleImageCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature39Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature39Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface overflow-hidden rounded-lg border shadow-sm"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-6">
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
