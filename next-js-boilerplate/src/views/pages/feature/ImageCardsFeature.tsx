"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const CARD_CLASS =
  "border-border bg-surface group flex flex-col overflow-hidden rounded-lg border transition-colors hover:bg-surface-hover" as const;
const CARD_LINK_CLASS =
  "text-fg inline-flex items-center gap-1.5 text-sm font-medium" as const;

const CARDS = [
  {
    titleKey: "feature72Card1Title",
    bodyKey: "feature72Card1Body",
    altKey: "feature72Card1ImageAlt",
    imageUrl: "https://picsum.photos/seed/feature72-card1/480/480",
  },
  {
    titleKey: "feature72Card2Title",
    bodyKey: "feature72Card2Body",
    altKey: "feature72Card2ImageAlt",
    imageUrl: "https://picsum.photos/seed/feature72-card2/480/480",
  },
  {
    titleKey: "feature72Card3Title",
    bodyKey: "feature72Card3Body",
    altKey: "feature72Card3ImageAlt",
    imageUrl: "https://picsum.photos/seed/feature72-card3/480/480",
  },
  {
    titleKey: "feature72Card4Title",
    bodyKey: "feature72Card4Body",
    altKey: "feature72Card4ImageAlt",
    imageUrl: "https://picsum.photos/seed/feature72-card4/480/480",
  },
] as const;

export function ImageCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature72Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature72Intro}</p>
          <a
            href={LINK_URL}
            className="text-fg group mt-1 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {f.feature72LinkLabel}
            <IconArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <a key={card.titleKey} href={LINK_URL} className={CARD_CLASS}>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={card.imageUrl}
                  alt={f[card.altKey]}
                  width={480}
                  height={480}
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
                <span className={CARD_LINK_CLASS}>
                  {f.feature72LinkLabel}
                  <IconArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
