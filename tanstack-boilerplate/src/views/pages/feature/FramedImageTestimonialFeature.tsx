"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function FramedImageTestimonialFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature141Heading}
        </h2>
        <div className="border-border bg-surface mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border p-2">
          <Image
            src="/img/placeholders/ph-16x9-6.webp"
            alt={f.feature141ImageAlt}
            width={800}
            height={450}
            className="aspect-video w-full rounded-xl object-cover"
          />
        </div>
        <blockquote className="text-fg mx-auto mt-8 max-w-xl text-lg leading-relaxed font-medium">
          &ldquo;{f.feature141Quote}&rdquo;
        </blockquote>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Image
            src="/img/placeholders/ph-1x1-5.webp"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          <div className="flex flex-col items-start">
            <span className="text-fg text-sm font-semibold">{f.feature141AuthorName}</span>
            <span className="text-muted text-xs">{f.feature141AuthorRole}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
