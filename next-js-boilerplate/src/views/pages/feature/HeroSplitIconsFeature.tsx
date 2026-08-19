"use client";

import Image from "next/image";
import { IconBolt, IconChartBar, IconShieldCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const HERO_IMAGE =
  "https://picsum.photos/seed/feature230-hero/1600/900" as const;
const IMAGE_SIZES = "(max-width: 1280px) 100vw, 1152px";

const FEATURE_ITEMS = [
  {
    Icon: IconBolt,
    titleKey: "feature230Item1Title",
    bodyKey: "feature230Item1Body",
  },
  {
    Icon: IconShieldCheck,
    titleKey: "feature230Item2Title",
    bodyKey: "feature230Item2Body",
  },
  {
    Icon: IconChartBar,
    titleKey: "feature230Item3Title",
    bodyKey: "feature230Item3Body",
  },
] as const;

const PILL_KEYS = ["feature230Pill1", "feature230Pill2"] as const;

export function HeroSplitIconsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {f.feature230Heading}
          </h2>
          <p className="text-muted leading-relaxed lg:pb-1 lg:text-lg">
            {f.feature230Intro}
          </p>
        </div>
        <div className="border-border relative mt-12 aspect-video overflow-hidden rounded-lg border">
          <Image
            src={HERO_IMAGE}
            alt={f.feature230ImageAlt}
            width={1600}
            height={900}
            sizes={IMAGE_SIZES}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {PILL_KEYS.map((pillKey) => (
              <span
                key={pillKey}
                className="border-border bg-bg/80 text-fg rounded-full border px-3 py-1 text-xs font-medium"
              >
                {f[pillKey]}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURE_ITEMS.map((item) => (
            <div key={item.titleKey} className="flex flex-col gap-3">
              <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-md">
                <item.Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[item.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[item.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
