"use client";

import Image from "next/image";
import { IconBolt, IconChartDots } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function CenteredBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature206Heading}
          </h2>
          <p className="text-muted">{f.feature206Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="border-border bg-surface relative overflow-hidden rounded-lg border lg:col-span-2 lg:row-span-2">
            <Image
              src="/img/placeholders/ph-4x5-4.webp"
              alt={f.feature206Cell1ImageAlt}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
            <span className="bg-bg/70 absolute inset-x-0 bottom-0 px-5 py-4 text-sm font-medium backdrop-blur-sm">
              {f.feature206Cell1Caption}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col justify-end gap-3 rounded-lg border p-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
              <IconChartDots size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature206Cell2Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature206Cell2Body}
            </p>
          </div>
          <div className="border-border bg-surface flex flex-col justify-end gap-2 rounded-lg border p-6">
            <span className="text-fg text-4xl font-semibold tracking-tight">
              {f.feature206Cell3StatValue}
            </span>
            <span className="text-muted text-sm">
              {f.feature206Cell3StatLabel}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
              <IconBolt size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature206Cell4Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature206Cell4Body}
            </p>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border lg:col-span-2">
            <div className="aspect-[16/9]">
              <Image
                src="/img/placeholders/ph-16x9-2.webp"
                alt={f.feature206Cell5ImageAlt}
                width={800}
                height={450}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-fg block px-5 py-4 text-sm font-medium">
              {f.feature206Cell5Caption}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
