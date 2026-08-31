"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function TieredToolCatalogFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature257Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature257Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-6 sm:row-span-2">
            <div className="flex items-center justify-between">
              <Image
                src="/img/placeholders/ph-1x1-2.webp"
                alt=""
                aria-hidden="true"
                width={40}
                height={40}
                className="size-10 rounded-lg object-cover"
              />
              <Badge>{f.feature257FeaturedBadge}</Badge>
            </div>
            <h3 className="text-fg text-lg font-semibold">
              {f.feature257FeaturedTitle}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature257FeaturedBody}
            </p>
          </div>
          <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-5">
            <Image
              src="/img/placeholders/ph-1x1-4.webp"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="size-8 rounded-md object-cover"
            />
            <span className="text-fg text-sm font-medium">
              {f.feature257Tool1Title}
            </span>
          </div>
          <div className="border-border bg-surface flex items-center gap-3 rounded-xl border p-5">
            <Image
              src="/img/placeholders/ph-1x1-5.webp"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="size-8 rounded-md object-cover"
            />
            <span className="text-fg text-sm font-medium">
              {f.feature257Tool2Title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
