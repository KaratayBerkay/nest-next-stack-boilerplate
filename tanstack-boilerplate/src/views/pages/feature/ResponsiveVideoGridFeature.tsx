"use client";

import Image from "next/image";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const VIDEOS = [
  {
    titleKey: "feature215aCard1Title",
    altKey: "feature215aCard1ImageAlt",
    src: "/img/placeholders/ph-16x9-6.webp",
  },
  {
    titleKey: "feature215aCard2Title",
    altKey: "feature215aCard2ImageAlt",
    src: "/img/placeholders/ph-16x9-0.webp",
  },
  {
    titleKey: "feature215aCard3Title",
    altKey: "feature215aCard3ImageAlt",
    src: "/img/placeholders/ph-16x9-0.webp",
  },
  {
    titleKey: "feature215aCard4Title",
    altKey: "feature215aCard4ImageAlt",
    src: "/img/placeholders/ph-16x9-3.webp",
  },
  {
    titleKey: "feature215aCard5Title",
    altKey: "feature215aCard5ImageAlt",
    src: "/img/placeholders/ph-16x9-5.webp",
  },
  {
    titleKey: "feature215aCard6Title",
    altKey: "feature215aCard6ImageAlt",
    src: "/img/placeholders/ph-16x9-5.webp",
  },
] as const;

const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export function ResponsiveVideoGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature215aHeading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature215aIntro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((video) => (
            <div
              key={video.titleKey}
              className="border-border bg-surface group overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.src}
                  alt={f[video.altKey]}
                  width={800}
                  height={450}
                  sizes={IMAGE_SIZES}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-bg/70 flex size-12 items-center justify-center rounded-full shadow-md backdrop-blur-sm">
                    <IconPlayerPlay
                      size={20}
                      className="text-fg ml-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-fg text-sm font-semibold">
                  {f[video.titleKey]}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
