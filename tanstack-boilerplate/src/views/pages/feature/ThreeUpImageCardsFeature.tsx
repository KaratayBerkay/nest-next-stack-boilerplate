"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARD_LINK_CLASS =
  "text-fg inline-flex items-center gap-1.5 text-sm font-medium" as const;

const CARDS = [
  {
    titleKey: "feature112Card1Title",
    bodyKey: "feature112Card1Body",
    altKey: "feature112Card1ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
  {
    titleKey: "feature112Card2Title",
    bodyKey: "feature112Card2Body",
    altKey: "feature112Card2ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
  {
    titleKey: "feature112Card3Title",
    bodyKey: "feature112Card3Body",
    altKey: "feature112Card3ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
] as const;

export function ThreeUpImageCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge>{f.feature112Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature112Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature112Intro}</p>
          <span className={CARD_LINK_CLASS}>
            {f.feature112LinkLabel}
            <IconArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.titleKey}
              className="border-border bg-surface flex flex-col overflow-hidden rounded-xl border"
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
              <div className="flex flex-col gap-2.5 p-6">
                <h3 className="text-fg text-lg font-semibold">
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
