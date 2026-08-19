"use client";

import Image from "next/image";
import { IconArrowRight, IconPlayerPlayFilled } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const ROWS = [
  {
    src: "https://picsum.photos/seed/feature215b-row1/1600/900",
    eyebrowKey: "feature215bRow1Eyebrow",
    titleKey: "feature215bRow1Title",
    bodyKey: "feature215bRow1Body",
    linkKey: "feature215bRow1Link",
    captionKey: "feature215bRow1Caption",
    imageAltKey: "feature215bRow1ImageAlt",
  },
  {
    src: "https://picsum.photos/seed/feature215b-row2/1600/900",
    eyebrowKey: "feature215bRow2Eyebrow",
    titleKey: "feature215bRow2Title",
    bodyKey: "feature215bRow2Body",
    linkKey: "feature215bRow2Link",
    captionKey: "feature215bRow2Caption",
    imageAltKey: "feature215bRow2ImageAlt",
  },
] as const;

export function VideoCopyRowsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature215bHeading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature215bIntro}</p>
        </div>
        <div className="mt-12 flex flex-col gap-16 lg:mt-16 lg:gap-24">
          {ROWS.map((row, index) => (
            <div
              key={row.titleKey}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div
                className={`border-border relative aspect-video overflow-hidden rounded-lg border ${index % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <Image
                  src={row.src}
                  alt={f[row.imageAltKey]}
                  width={1600}
                  height={900}
                  sizes={IMAGE_SIZES}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-brand text-brand-fg flex size-14 items-center justify-center rounded-full shadow-md">
                    <IconPlayerPlayFilled
                      size={24}
                      className="ml-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <span className="border-border bg-bg/80 text-fg absolute bottom-4 left-4 rounded-full border px-3 py-1 text-xs font-medium">
                  {f[row.captionKey]}
                </span>
              </div>
              <div className="flex flex-col items-start gap-3">
                <span className="text-brand text-sm font-semibold tracking-wider uppercase">
                  {f[row.eyebrowKey]}
                </span>
                <h3 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                  {f[row.titleKey]}
                </h3>
                <p className="text-muted leading-relaxed">{f[row.bodyKey]}</p>
                <span className="text-fg inline-flex items-center gap-1.5 text-sm font-medium">
                  {f[row.linkKey]}
                  <IconArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
