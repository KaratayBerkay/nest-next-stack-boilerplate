"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  {
    valueKey: "feature71Stat1Value",
    labelKey: "feature71Stat1Label",
  },
  {
    valueKey: "feature71Stat2Value",
    labelKey: "feature71Stat2Label",
  },
  {
    valueKey: "feature71Stat3Value",
    labelKey: "feature71Stat3Label",
  },
] as const;

const CARDS = [
  {
    titleKey: "feature71Card1Title",
    linkLabelKey: "feature71Card1LinkLabel",
    altKey: "feature71Card1ImageAlt",
    src: "/img/placeholders/ph-4x3-5.webp",
  },
  {
    titleKey: "feature71Card2Title",
    linkLabelKey: "feature71Card2LinkLabel",
    altKey: "feature71Card2ImageAlt",
    src: "/img/placeholders/ph-4x3-0.webp",
  },
  {
    titleKey: "feature71Card3Title",
    linkLabelKey: "feature71Card3LinkLabel",
    altKey: "feature71Card3ImageAlt",
    src: "/img/placeholders/ph-4x3-0.webp",
  },
] as const;

export function MetricsImageLinksFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature71Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature71Intro}</p>
        </div>
        <div className="border-border bg-surface sm:divide-border-border mt-12 grid rounded-lg border sm:grid-cols-3 sm:divide-x">
          {STATS.map((stat) => (
            <div key={stat.valueKey} className="flex flex-col gap-1 p-8">
              <span className="text-fg text-4xl font-semibold tracking-tight tabular-nums">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.titleKey}
              className="border-border bg-surface group flex h-full flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="text-fg text-lg font-semibold">
                  {f[card.titleKey]}
                </h3>
                <div className="mt-auto flex items-center gap-1.5">
                  <span className="text-fg text-sm font-medium">
                    {f[card.linkLabelKey]}
                  </span>
                  <IconArrowRight
                    size={14}
                    className="text-fg transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
