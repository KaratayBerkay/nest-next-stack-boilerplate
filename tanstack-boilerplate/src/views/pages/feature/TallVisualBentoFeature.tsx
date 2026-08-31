"use client";

import Image from "next/image";
import { IconBolt, IconChartBar } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function TallVisualBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature133Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature133Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="border-border bg-surface overflow-hidden rounded-xl border md:row-span-2">
            <Image
              src="/img/placeholders/ph-3x4-4.webp"
              alt={f.feature133ImageAlt}
              width={400}
              height={533}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6 md:col-span-2">
            <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
              <IconBolt size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature133Card1Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature133Card1Body}
            </p>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6 md:col-span-2">
            <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
              <IconChartBar size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature133Card2Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature133Card2Body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
