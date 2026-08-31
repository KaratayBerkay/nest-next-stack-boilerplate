"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature137Card1Title",
    bodyKey: "feature137Card1Body",
    altKey: "feature137Card1ImageAlt",
    src: "/img/placeholders/ph-4x3-2.webp",
  },
  {
    titleKey: "feature137Card2Title",
    bodyKey: "feature137Card2Body",
    altKey: "feature137Card2ImageAlt",
    src: "/img/placeholders/ph-4x3-0.webp",
  },
  {
    titleKey: "feature137Card3Title",
    bodyKey: "feature137Card3Body",
    altKey: "feature137Card3ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
  {
    titleKey: "feature137Card4Title",
    bodyKey: "feature137Card4Body",
    altKey: "feature137Card4ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
] as const;

export function ImageValueCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature137Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature137Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <article
              key={card.titleKey}
              className="border-border bg-surface flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.bodyKey]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
