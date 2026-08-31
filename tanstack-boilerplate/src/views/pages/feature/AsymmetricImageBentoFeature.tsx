"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function AsymmetricImageBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature37Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature37Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <div className="border-border bg-surface overflow-hidden rounded-xl border md:col-span-2 md:row-span-2">
            <Image
              src="/img/placeholders/ph-4x5-0.webp"
              alt={f.feature37Image1Alt}
              width={500}
              height={625}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-xl border md:col-span-2">
            <Image
              src="/img/placeholders/ph-2x1-2.webp"
              alt={f.feature37Image2Alt}
              width={500}
              height={250}
              className="aspect-[2/1] w-full object-cover"
            />
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-xl border">
            <Image
              src="/img/placeholders/ph-1x1-1.webp"
              alt={f.feature37Image3Alt}
              width={240}
              height={240}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-xl border">
            <Image
              src="/img/placeholders/ph-1x1-5.webp"
              alt={f.feature37Image4Alt}
              width={240}
              height={240}
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
