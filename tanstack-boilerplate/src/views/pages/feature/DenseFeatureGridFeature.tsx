"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const THUMB_WIDTH = 128;
const THUMB_HEIGHT = 128;

const CARDS = [
  {
    id: "search",
    titleKey: "feature190Card1Title",
    bodyKey: "feature190Card1Body",
    altKey: "feature190Card1ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-0.webp",
  },
  {
    id: "dashboards",
    titleKey: "feature190Card2Title",
    bodyKey: "feature190Card2Body",
    altKey: "feature190Card2ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-0.webp",
  },
  {
    id: "automations",
    titleKey: "feature190Card3Title",
    bodyKey: "feature190Card3Body",
    altKey: "feature190Card3ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-7.webp",
  },
  {
    id: "sharing",
    titleKey: "feature190Card4Title",
    bodyKey: "feature190Card4Body",
    altKey: "feature190Card4ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-1.webp",
  },
  {
    id: "analytics",
    titleKey: "feature190Card5Title",
    bodyKey: "feature190Card5Body",
    altKey: "feature190Card5ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-4.webp",
  },
  {
    id: "security",
    titleKey: "feature190Card6Title",
    bodyKey: "feature190Card6Body",
    altKey: "feature190Card6ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-5.webp",
  },
  {
    id: "integrations",
    titleKey: "feature190Card7Title",
    bodyKey: "feature190Card7Body",
    altKey: "feature190Card7ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-3.webp",
  },
  {
    id: "mobile",
    titleKey: "feature190Card8Title",
    bodyKey: "feature190Card8Body",
    altKey: "feature190Card8ImageAlt",
    imageUrl: "/img/placeholders/ph-1x1-1.webp",
  },
] as const;

export function DenseFeatureGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature190Heading}
          </h2>
          <p className="text-muted">{f.feature190Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={card.imageUrl}
                  alt={f[card.altKey]}
                  width={THUMB_WIDTH}
                  height={THUMB_HEIGHT}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="text-fg text-sm font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted truncate text-sm">{f[card.bodyKey]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
