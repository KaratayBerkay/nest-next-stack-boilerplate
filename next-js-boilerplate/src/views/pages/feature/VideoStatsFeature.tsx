"use client";

import Image from "next/image";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const VIDEO_SRC =
  "https://picsum.photos/seed/feature220a-video/1200/675" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 1024px";

const STATS = [
  { valueKey: "feature220aStat1Value", labelKey: "feature220aStat1Label" },
  { valueKey: "feature220aStat2Value", labelKey: "feature220aStat2Label" },
  { valueKey: "feature220aStat3Value", labelKey: "feature220aStat3Label" },
] as const;

export function VideoStatsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature220aEyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature220aHeading}
          </h2>
          <p className="text-muted">{f.feature220aIntro}</p>
        </div>
        <div className="border-border relative mt-12 overflow-hidden rounded-lg border">
          <Image
            src={VIDEO_SRC}
            alt={f.feature220aImageAlt}
            width={1200}
            height={675}
            sizes={IMAGE_SIZES}
            className="aspect-video w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              role="button"
              aria-label={f.feature220aPlayLabel}
              className="bg-bg/70 flex size-16 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm"
            >
              <IconPlayerPlay
                size={28}
                className="text-fg ml-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
        <div className="border-border divide-border mt-12 grid divide-y rounded-lg border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
      </div>
    </section>
  );
}
