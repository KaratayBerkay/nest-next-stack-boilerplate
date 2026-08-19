"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STUDIO_ITEMS = [
  {
    numKey: "feature314Num1",
    titleKey: "feature314Card1Title",
    bodyKey: "feature314Card1Body",
    imageAltKey: "feature314Card1ImageAlt",
    src: "https://picsum.photos/seed/feature314-1/800/600",
  },
  {
    numKey: "feature314Num2",
    titleKey: "feature314Card2Title",
    bodyKey: "feature314Card2Body",
    imageAltKey: "feature314Card2ImageAlt",
    src: "https://picsum.photos/seed/feature314-2/800/600",
  },
  {
    numKey: "feature314Num3",
    titleKey: "feature314Card3Title",
    bodyKey: "feature314Card3Body",
    imageAltKey: "feature314Card3ImageAlt",
    src: "https://picsum.photos/seed/feature314-3/800/600",
  },
  {
    numKey: "feature314Num4",
    titleKey: "feature314Card4Title",
    bodyKey: "feature314Card4Body",
    imageAltKey: "feature314Card4ImageAlt",
    src: "https://picsum.photos/seed/feature314-4/800/600",
  },
  {
    numKey: "feature314Num5",
    titleKey: "feature314Card5Title",
    bodyKey: "feature314Card5Body",
    imageAltKey: "feature314Card5ImageAlt",
    src: "https://picsum.photos/seed/feature314-5/800/600",
  },
  {
    numKey: "feature314Num6",
    titleKey: "feature314Card6Title",
    bodyKey: "feature314Card6Body",
    imageAltKey: "feature314Card6ImageAlt",
    src: "https://picsum.photos/seed/feature314-6/800/600",
  },
] as const;

export function StudioGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature314Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature314Intro}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIO_ITEMS.map((item) => (
            <article
              key={item.titleKey}
              className="border-border bg-surface flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={item.src}
                  alt={f[item.imageAltKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="bg-brand/10 text-brand inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tabular-nums">
                    {f[item.numKey]}
                  </span>
                  <h3 className="text-fg text-base font-semibold">
                    {f[item.titleKey]}
                  </h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {f[item.bodyKey]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
