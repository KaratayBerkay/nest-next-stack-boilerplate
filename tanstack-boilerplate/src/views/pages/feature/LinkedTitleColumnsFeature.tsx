"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature13Item1Title",
    bodyKey: "feature13Item1Body",
    linkLabelKey: "feature13Item1LinkLabel",
    imageAltKey: "feature13Item1ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
  {
    titleKey: "feature13Item2Title",
    bodyKey: "feature13Item2Body",
    linkLabelKey: "feature13Item2LinkLabel",
    imageAltKey: "feature13Item2ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
] as const;

export function LinkedTitleColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {CARDS.map((card) => (
            <article
              key={card.titleKey}
              className="border-border bg-surface group flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.imageAltKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-fg text-lg font-semibold">
                    {f[card.titleKey]}
                  </h3>
                  <span className="text-fg inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
                    {f[card.linkLabelKey]}
                    <IconArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
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
