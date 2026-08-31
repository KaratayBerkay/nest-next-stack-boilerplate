"use client";

import Image from "next/image";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const CARDS = [
  {
    titleKey: "feature80Card1Title",
    imageAltKey: "feature80Card1ImageAlt",
    link1Key: "feature80Card1Link1",
    link2Key: "feature80Card1Link2",
    src: "/img/placeholders/ph-1x1-2.webp",
  },
  {
    titleKey: "feature80Card2Title",
    imageAltKey: "feature80Card2ImageAlt",
    link1Key: "feature80Card2Link1",
    link2Key: "feature80Card2Link2",
    src: "/img/placeholders/ph-1x1-5.webp",
  },
  {
    titleKey: "feature80Card3Title",
    imageAltKey: "feature80Card3ImageAlt",
    link1Key: "feature80Card3Link1",
    link2Key: "feature80Card3Link2",
    src: "/img/placeholders/ph-1x1-7.webp",
  },
] as const;

export function SquareImageDualLinksFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature80Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature80Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.imageAltKey]}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-5 p-6">
                <h3 className="text-fg text-lg font-semibold">
                  {f[card.titleKey]}
                </h3>
                <div className="mt-auto flex flex-col gap-2.5">
                  <a
                    href={LINK_URL}
                    className="bg-brand text-brand-fg inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    {f[card.link1Key]}
                    <IconArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a
                    href={LINK_URL}
                    className="border-border text-fg hover:bg-surface-hover inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
                  >
                    {f[card.link2Key]}
                    <IconArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
