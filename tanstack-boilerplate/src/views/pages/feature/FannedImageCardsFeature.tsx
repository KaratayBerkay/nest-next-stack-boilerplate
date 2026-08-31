"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  { id: "c1", src: "/img/placeholders/ph-3x4-0.webp", rotate: "-rotate-6", titleKey: "feature234Card1Title", altKey: "feature234Card1ImageAlt" },
  { id: "c2", src: "/img/placeholders/ph-3x4-2.webp", rotate: "-rotate-2", titleKey: "feature234Card2Title", altKey: "feature234Card2ImageAlt" },
  { id: "c3", src: "/img/placeholders/ph-3x4-4.webp", rotate: "rotate-0", titleKey: "feature234Card3Title", altKey: "feature234Card3ImageAlt" },
  { id: "c4", src: "/img/placeholders/ph-3x4-6.webp", rotate: "rotate-2", titleKey: "feature234Card4Title", altKey: "feature234Card4ImageAlt" },
  { id: "c5", src: "/img/placeholders/ph-3x4-7.webp", rotate: "rotate-6", titleKey: "feature234Card5Title", altKey: "feature234Card5ImageAlt" },
] as const;

export function FannedImageCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature234Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature234Intro}</p>
      </div>
      <div className="mx-auto mt-16 flex max-w-4xl items-end justify-center -space-x-6 px-6 lg:px-8">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className={`group border-border bg-surface hover:z-10 hover:-translate-y-2 relative w-1/5 shrink-0 overflow-hidden rounded-xl border shadow-md transition-transform ${card.rotate} hover:rotate-0`}
          >
            <Image
              src={card.src}
              alt={f[card.altKey]}
              width={200}
              height={267}
              className="aspect-[3/4] w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-center text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {f[card.titleKey]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
