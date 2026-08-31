"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  {
    id: "s1",
    valueKey: "feature312Stat1Value",
    labelKey: "feature312Stat1Label",
  },
  {
    id: "s2",
    valueKey: "feature312Stat2Value",
    labelKey: "feature312Stat2Label",
  },
  {
    id: "s3",
    valueKey: "feature312Stat3Value",
    labelKey: "feature312Stat3Label",
  },
  {
    id: "s4",
    valueKey: "feature312Stat4Value",
    labelKey: "feature312Stat4Label",
  },
] as const;

export function StoryHeroStatCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature312Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature312Intro}</p>
        </div>
        <div className="border-border bg-surface mt-10 overflow-hidden rounded-2xl border">
          <Image
            src="/img/placeholders/ph-2x1-5.webp"
            alt={f.feature312ImageAlt}
            width={1200}
            height={600}
            className="aspect-[2/1] w-full object-cover"
          />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span className="text-fg text-2xl font-semibold tracking-tight">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-xs">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
