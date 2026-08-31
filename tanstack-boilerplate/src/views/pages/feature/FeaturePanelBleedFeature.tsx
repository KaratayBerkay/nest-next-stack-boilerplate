"use client";

import Image from "next/image";
import {
  IconLock,
  IconSearch,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SRC = "/img/placeholders/ph-4x5-2.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";
const ICON_BOX_CLASS =
  "bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-md" as const;

const ITEMS = [
  {
    titleKey: "feature87Item1Title",
    bodyKey: "feature87Item1Body",
    Icon: IconSearch,
  },
  {
    titleKey: "feature87Item2Title",
    bodyKey: "feature87Item2Body",
    Icon: IconUsers,
  },
  {
    titleKey: "feature87Item3Title",
    bodyKey: "feature87Item3Body",
    Icon: IconLock,
  },
  {
    titleKey: "feature87Item4Title",
    bodyKey: "feature87Item4Body",
    Icon: IconWallet,
  },
] as const;

export function FeaturePanelBleedFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid overflow-hidden rounded-[2rem] border lg:grid-cols-2">
          <div className="flex flex-col items-start gap-8 p-8 lg:p-12">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature87Heading}
              </h2>
              <p className="text-muted leading-relaxed">
                {f.feature87Paragraph}
              </p>
            </div>
            <div className="flex w-full flex-col gap-5">
              {ITEMS.map((item) => (
                <div key={item.titleKey} className="flex items-start gap-4">
                  <span className={ICON_BOX_CLASS}>
                    <item.Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-fg text-base font-semibold">
                      {f[item.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f[item.bodyKey]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
            <Image
              src={IMAGE_SRC}
              alt={f.feature87ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
