"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LAYERED_IMAGES = [
  {
    src: "/img/placeholders/ph-4x3-4.webp",
    altKey: "feature189Image1Alt",
    className: "left-0 top-0 z-10 w-3/5 -rotate-3",
  },
  {
    src: "/img/placeholders/ph-4x3-1.webp",
    altKey: "feature189Image2Alt",
    className: "right-0 top-10 z-20 w-3/5 rotate-2",
  },
  {
    src: "/img/placeholders/ph-4x3-7.webp",
    altKey: "feature189Image3Alt",
    className: "bottom-0 left-1/4 z-30 w-3/5 -rotate-1",
  },
] as const;

const FEATURE_ITEMS = [
  { titleKey: "feature189Item1Title", bodyKey: "feature189Item1Body" },
  { titleKey: "feature189Item2Title", bodyKey: "feature189Item2Body" },
  { titleKey: "feature189Item3Title", bodyKey: "feature189Item3Body" },
] as const;

export function LayeredSplitListFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative mt-4 aspect-[4/3] lg:mt-0">
            {LAYERED_IMAGES.map((image) => (
              <div
                key={image.altKey}
                className={`border-border bg-surface absolute aspect-[4/3] overflow-hidden rounded-lg border shadow-lg ${image.className}`}
              >
                <Image
                  src={image.src}
                  alt={f[image.altKey]}
                  width={640}
                  height={480}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature189Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature189Intro}</p>
            <div className="mt-2 flex flex-col gap-5">
              {FEATURE_ITEMS.map((item) => (
                <div key={item.titleKey} className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[item.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[item.bodyKey]}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-2">
              <span>{f.feature189CtaLabel}</span>
              <IconArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
