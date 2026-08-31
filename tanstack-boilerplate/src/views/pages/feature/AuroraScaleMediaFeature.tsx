"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function AuroraScaleMediaFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <div
        aria-hidden="true"
        className="bg-brand/25 absolute top-0 left-1/4 -z-10 size-72 -translate-y-1/2 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-info/20 absolute top-10 right-1/4 -z-10 size-72 rounded-full blur-3xl"
      />
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
          {f.feature249Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature249Intro}</p>
        <div className="border-border bg-surface/80 mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm">
          <Image
            src="/img/placeholders/ph-16x9-4.webp"
            alt={f.feature249ImageAlt}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
