"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const BROWSER_CARDS = [
  {
    altKey: "feature238Card1ImageAlt",
    src: "https://picsum.photos/seed/feature238-card1/800/600",
    stackClass: "relative z-30 shadow-lg",
    hoverClass: "transition-transform duration-300 hover:-translate-y-1",
  },
  {
    altKey: "feature238Card2ImageAlt",
    src: "https://picsum.photos/seed/feature238-card2/800/600",
    stackClass:
      "relative z-20 -mt-16 translate-x-8 -rotate-2 shadow-md lg:-mt-24",
    hoverClass: "",
  },
  {
    altKey: "feature238Card3ImageAlt",
    src: "https://picsum.photos/seed/feature238-card3/800/600",
    stackClass:
      "relative z-10 -mt-16 -translate-x-8 rotate-2 shadow-md lg:-mt-24",
    hoverClass: "",
  },
] as const;

export function LayeredBrowserCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature238Eyebrow}
          </span>
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
            {f.feature238Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {f.feature238Intro}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <span className="bg-brand text-brand-fg inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm">
              {f.feature238CtaLabel}
            </span>
            <span className="text-fg group inline-flex items-center gap-1.5 text-sm font-medium">
              {f.feature238DemoLabel}
              <IconArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
        <div className="mx-auto mt-16 flex w-full max-w-3xl flex-col pb-10">
          {BROWSER_CARDS.map((card) => (
            <div
              key={card.altKey}
              className={`border-border bg-surface w-full overflow-hidden rounded-xl border ${card.stackClass} ${card.hoverClass}`}
            >
              <div className="border-border flex items-center gap-1.5 border-b px-4 py-3">
                <span
                  className="bg-bg size-2.5 rounded-full"
                  aria-hidden="true"
                />
                <span
                  className="bg-bg size-2.5 rounded-full"
                  aria-hidden="true"
                />
                <span
                  className="bg-bg size-2.5 rounded-full"
                  aria-hidden="true"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
