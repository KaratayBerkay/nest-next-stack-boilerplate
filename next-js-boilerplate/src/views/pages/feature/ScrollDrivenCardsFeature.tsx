"use client";

import Image from "next/image";
import { IconQuote } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature322Card1Title",
    bodyKey: "feature322Card1Body",
    imageAltKey: "feature322Card1ImageAlt",
    src: "https://picsum.photos/seed/feature322-1/800/600",
    stickyClass: "lg:top-24",
  },
  {
    titleKey: "feature322Card2Title",
    bodyKey: "feature322Card2Body",
    imageAltKey: "feature322Card2ImageAlt",
    src: "https://picsum.photos/seed/feature322-2/800/600",
    stickyClass: "lg:top-32",
  },
  {
    titleKey: "feature322Card3Title",
    bodyKey: "feature322Card3Body",
    imageAltKey: "feature322Card3ImageAlt",
    src: "https://picsum.photos/seed/feature322-3/800/600",
    stickyClass: "lg:top-40",
  },
  {
    titleKey: "feature322Card4Title",
    bodyKey: "feature322Card4Body",
    imageAltKey: "feature322Card4ImageAlt",
    src: "https://picsum.photos/seed/feature322-4/800/600",
    stickyClass: "lg:top-48",
  },
] as const;

const STATS = [
  { valueKey: "feature322Stat1Value", labelKey: "feature322Stat1Label" },
  { valueKey: "feature322Stat2Value", labelKey: "feature322Stat2Label" },
  { valueKey: "feature322Stat3Value", labelKey: "feature322Stat3Label" },
] as const;

export function ScrollDrivenCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature322Heading}
          </h2>
          <p className="text-muted">{f.feature322Intro}</p>
        </div>
        <div className="mt-12 flex flex-col gap-6">
          {CARDS.map((card) => (
            <article
              key={card.titleKey}
              className={`border-border bg-surface overflow-hidden rounded-lg border lg:sticky lg:self-start ${card.stickyClass}`}
            >
              <div className="grid md:grid-cols-2">
                <div className="relative overflow-hidden">
                  <Image
                    src={card.src}
                    alt={f[card.imageAltKey]}
                    width={800}
                    height={600}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3 p-6 lg:p-8">
                  <h3 className="text-fg text-xl font-semibold tracking-tight">
                    {f[card.titleKey]}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {f[card.bodyKey]}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="border-border divide-border mt-14 grid divide-y rounded-lg border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="flex flex-col items-center gap-1 px-6 py-8 text-center"
            >
              <span className="text-fg text-3xl font-semibold tracking-tight">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
        <figure className="border-border bg-surface mt-8 flex flex-col gap-5 rounded-lg border p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <span
              className="bg-brand/10 text-brand flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              aria-hidden="true"
            >
              {f.feature322AuthorInitials}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-fg text-sm font-semibold">
                {f.feature322TestimonialAuthor}
              </span>
              <span className="text-muted text-xs">
                {f.feature322TestimonialRole}
              </span>
            </div>
          </div>
          <blockquote className="text-fg text-lg leading-relaxed">
            {f.feature322TestimonialQuote}
          </blockquote>
          <span
            className="bg-brand/10 text-brand flex size-8 items-center justify-center rounded-md"
            aria-hidden="true"
          >
            <IconQuote size={14} />
          </span>
        </figure>
      </div>
    </section>
  );
}
