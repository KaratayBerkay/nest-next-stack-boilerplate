"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARD_CLASS =
  "border-border bg-surface group flex flex-col overflow-hidden rounded-xl border transition-colors hover:bg-surface-hover" as const;
const CARD_LINK_CLASS =
  "text-fg inline-flex items-center gap-1.5 text-sm font-medium" as const;

const CARDS = [
  {
    titleKey: "feature132Card1Title",
    bodyKey: "feature132Card1Body",
    altKey: "feature132Card1ImageAlt",
    src: "https://picsum.photos/seed/feature132-card1/800/600",
  },
  {
    titleKey: "feature132Card2Title",
    bodyKey: "feature132Card2Body",
    altKey: "feature132Card2ImageAlt",
    src: "https://picsum.photos/seed/feature132-card2/800/600",
  },
  {
    titleKey: "feature132Card3Title",
    bodyKey: "feature132Card3Body",
    altKey: "feature132Card3ImageAlt",
    src: "https://picsum.photos/seed/feature132-card3/800/600",
  },
  {
    titleKey: "feature132Card4Title",
    bodyKey: "feature132Card4Body",
    altKey: "feature132Card4ImageAlt",
    src: "https://picsum.photos/seed/feature132-card4/800/600",
  },
] as const;

export function LinkedImageCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature132Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature132Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.titleKey} className={CARD_CLASS}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="bg-surface-hover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-30"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.bodyKey]}
                </p>
                <span className={`${CARD_LINK_CLASS} mt-auto pt-2`}>
                  {f.feature132LinkLabel}
                  <IconArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
