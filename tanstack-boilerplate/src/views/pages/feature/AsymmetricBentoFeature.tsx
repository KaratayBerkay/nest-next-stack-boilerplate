"use client";

import Image from "next/image";
import { IconBolt, IconChartBar, IconStack2 } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function AsymmetricBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature193Heading}
          </h2>
          <p className="text-muted">{f.feature193Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-lg border lg:row-span-3 lg:aspect-auto lg:h-full">
            <Image
              src="/img/placeholders/ph-4x5-7.webp"
              alt={f.feature193Card1ImageAlt}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
            <span className="bg-bg/70 absolute inset-x-0 bottom-0 px-5 py-4 text-sm font-medium backdrop-blur-sm">
              {f.feature193Card1Caption}
            </span>
          </div>
          <div className="border-border bg-surface relative aspect-[16/9] overflow-hidden rounded-lg border lg:col-span-2 lg:aspect-auto">
            <Image
              src="/img/placeholders/ph-16x9-0.webp"
              alt={f.feature193Card2ImageAlt}
              width={800}
              height={450}
              className="h-full w-full object-cover"
            />
            <span className="bg-bg/70 absolute inset-x-0 bottom-0 px-5 py-4 text-sm font-medium backdrop-blur-sm">
              {f.feature193Card2Caption}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
              <IconBolt size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature193Card3Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature193Card3Body}
            </p>
          </div>
          <div className="border-border bg-surface flex flex-col justify-center gap-1 rounded-lg border p-6">
            <span className="text-fg text-4xl font-semibold tracking-tight">
              {f.feature193StatValue}
            </span>
            <span className="text-muted text-sm">{f.feature193StatLabel}</span>
            <span className="bg-brand/10 text-brand mt-3 flex size-9 items-center justify-center rounded-md">
              <IconChartBar size={18} aria-hidden="true" />
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6 lg:col-span-2">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
              <IconStack2 size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature193Card5Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature193Card5Body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
