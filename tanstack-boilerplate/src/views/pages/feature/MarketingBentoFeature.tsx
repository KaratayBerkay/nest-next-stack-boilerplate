"use client";

import Image from "next/image";
import { IconChartBar } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const AVATARS = [
  { seed: "feature261-a", fallback: "AM" },
  { seed: "feature261-b", fallback: "NR" },
  { seed: "feature261-c", fallback: "ST" },
  { seed: "feature261-d", fallback: "LC" },
  { seed: "feature261-e", fallback: "EN" },
] as const;

export function MarketingBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">
            {f.feature261Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature261Heading}
          </h2>
          <p className="text-muted">{f.feature261Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-lg border sm:aspect-[3/2] lg:row-span-2 lg:aspect-auto">
            <Image
              src="/img/placeholders/ph-4x5-5.webp"
              alt={f.feature261Cell1ImageAlt}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
            <span className="bg-bg/70 absolute inset-x-0 bottom-0 px-5 py-4 text-sm font-medium backdrop-blur-sm">
              {f.feature261Cell1Caption}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col justify-end gap-2 rounded-lg border p-6">
            <span className="text-fg text-4xl font-semibold tracking-tight">
              {f.feature261StatValue}
            </span>
            <span className="text-muted text-sm">{f.feature261StatLabel}</span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6">
            <AvatarGroup max={5}>
              {AVATARS.map((avatar) => (
                <Avatar
                  key={avatar.seed}
                  src={placeholderImage(avatar.seed, "1x1")}
                  fallback={avatar.fallback}
                />
              ))}
            </AvatarGroup>
            <p className="text-muted text-sm">{f.feature261AvatarsText}</p>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <div className="aspect-[16/9]">
              <Image
                src="/img/placeholders/ph-16x9-5.webp"
                alt={f.feature261Cell3ImageAlt}
                width={800}
                height={450}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-fg block px-5 py-4 text-sm font-medium">
              {f.feature261Cell3Caption}
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
              <IconChartBar size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-base font-semibold">
              {f.feature261Cell4Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature261Cell4Body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
