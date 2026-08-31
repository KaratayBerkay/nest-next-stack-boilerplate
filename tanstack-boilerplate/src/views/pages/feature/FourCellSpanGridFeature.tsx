"use client";

import Image from "next/image";
import { IconArrowUpRight, IconBolt, IconUsers } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function FourCellSpanGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature163Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature163Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <div className="border-border bg-surface relative overflow-hidden rounded-xl border md:col-span-2 md:row-span-2">
            <Image
              src="/img/placeholders/ph-4x3-3.webp"
              alt={f.feature163SpanImageAlt}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover md:h-full"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
              <h3 className="text-lg font-semibold text-white">
                {f.feature163SpanTitle}
              </h3>
              <p className="max-w-sm text-sm text-white/80">
                {f.feature163SpanBody}
              </p>
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6">
            <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
              <IconBolt size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-sm font-semibold">
              {f.feature163Card1Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature163Card1Body}
            </p>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6">
            <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
              <IconUsers size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-sm font-semibold">
              {f.feature163Card2Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature163Card2Body}
            </p>
            <span className="text-brand mt-auto inline-flex items-center gap-1 text-sm font-medium">
              {f.feature163Card2Link}
              <IconArrowUpRight size={14} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
