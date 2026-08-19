"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const ITEMS = [
  {
    titleKey: "feature79Item1Title",
    bodyKey: "feature79Item1Body",
    arrowLabelKey: "feature79Item1ArrowLabel",
    imageAltKey: "feature79Item1ImageAlt",
    src: "https://picsum.photos/seed/feature79-item1/800/600",
  },
  {
    titleKey: "feature79Item2Title",
    bodyKey: "feature79Item2Body",
    arrowLabelKey: "feature79Item2ArrowLabel",
    imageAltKey: "feature79Item2ImageAlt",
    src: "https://picsum.photos/seed/feature79-item2/800/600",
  },
  {
    titleKey: "feature79Item3Title",
    bodyKey: "feature79Item3Body",
    arrowLabelKey: "feature79Item3ArrowLabel",
    imageAltKey: "feature79Item3ImageAlt",
    src: "https://picsum.photos/seed/feature79-item3/800/600",
  },
] as const;

export function FeaturedMediaLinksFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature79Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature79Intro}</p>
        </div>
        <div className="mt-12 flex flex-col gap-6">
          {ITEMS.map((item) => (
            <a
              key={item.titleKey}
              href={LINK_URL}
              className="border-border bg-surface group hover:bg-surface-hover grid gap-6 rounded-lg border p-5 transition-colors sm:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]"
            >
              <div className="relative aspect-video overflow-hidden rounded-md sm:aspect-square">
                <Image
                  src={item.src}
                  alt={f[item.imageAltKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2.5 self-center">
                <h3 className="text-fg text-xl font-semibold">
                  {f[item.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[item.bodyKey]}
                </p>
                <span className="text-fg inline-flex items-center gap-1.5 text-sm font-medium">
                  {f[item.arrowLabelKey]}
                  <IconArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
