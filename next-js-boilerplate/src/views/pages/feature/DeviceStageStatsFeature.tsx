"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function DeviceStageStatsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
          {f.feature183Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature183Intro}</p>
      </div>
      <div className="relative mx-auto mt-14 max-w-3xl px-6 lg:px-8">
        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xl">
          <Image
            src="/img/placeholders/ph-16x9-3.webp"
            alt={f.feature183ImageAlt}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="border-border bg-bg absolute -top-6 -left-4 hidden flex-col gap-0.5 rounded-xl border px-4 py-3 shadow-lg sm:flex">
          <span className="text-fg text-xl font-semibold">
            {f.feature183Stat1Value}
          </span>
          <span className="text-muted text-xs">{f.feature183Stat1Label}</span>
        </div>
        <div className="border-border bg-bg absolute -right-4 -bottom-6 hidden flex-col gap-0.5 rounded-xl border px-4 py-3 shadow-lg sm:flex">
          <span className="text-fg text-xl font-semibold">
            {f.feature183Stat2Value}
          </span>
          <span className="text-muted text-xs">{f.feature183Stat2Label}</span>
        </div>
      </div>
    </section>
  );
}
