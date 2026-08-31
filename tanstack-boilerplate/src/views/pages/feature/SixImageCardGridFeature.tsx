"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  { id: "c1", src: "/img/placeholders/ph-4x3-0.webp", titleKey: "feature63Card1Title", altKey: "feature63Card1ImageAlt" },
  { id: "c2", src: "/img/placeholders/ph-4x3-1.webp", titleKey: "feature63Card2Title", altKey: "feature63Card2ImageAlt" },
  { id: "c3", src: "/img/placeholders/ph-4x3-2.webp", titleKey: "feature63Card3Title", altKey: "feature63Card3ImageAlt" },
  { id: "c4", src: "/img/placeholders/ph-4x3-4.webp", titleKey: "feature63Card4Title", altKey: "feature63Card4ImageAlt" },
  { id: "c5", src: "/img/placeholders/ph-4x3-5.webp", titleKey: "feature63Card5Title", altKey: "feature63Card5ImageAlt" },
  { id: "c6", src: "/img/placeholders/ph-4x3-6.webp", titleKey: "feature63Card6Title", altKey: "feature63Card6ImageAlt" },
] as const;

export function SixImageCardGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature63Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature63Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.id} className="flex flex-col gap-3">
              <div className="border-border bg-surface overflow-hidden rounded-lg border">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={480}
                  height={360}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <h3 className="text-fg text-sm font-semibold">
                {f[card.titleKey]}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
