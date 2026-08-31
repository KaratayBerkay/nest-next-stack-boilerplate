"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

const START_POSITION = 50;

interface Comparison {
  id: string;
  titleKey: string;
  beforeSeed: string;
  afterSeed: string;
  beforeAltKey: string;
  afterAltKey: string;
}

const COMPARISONS: Comparison[] = [
  {
    id: "color-grade",
    titleKey: "galleryBlocks4Example1Title",
    beforeSeed: "gallery4-grade-before",
    afterSeed: "gallery4-grade-after",
    beforeAltKey: "galleryBlocks4Example1BeforeAlt",
    afterAltKey: "galleryBlocks4Example1AfterAlt",
  },
  {
    id: "studio-retouch",
    titleKey: "galleryBlocks4Example2Title",
    beforeSeed: "gallery4-retouch-before",
    afterSeed: "gallery4-retouch-after",
    beforeAltKey: "galleryBlocks4Example2BeforeAlt",
    afterAltKey: "galleryBlocks4Example2AfterAlt",
  },
  {
    id: "room-staging",
    titleKey: "galleryBlocks4Example3Title",
    beforeSeed: "gallery4-staging-before",
    afterSeed: "gallery4-staging-after",
    beforeAltKey: "galleryBlocks4Example3BeforeAlt",
    afterAltKey: "galleryBlocks4Example3AfterAlt",
  },
];

export function BeforeAfterSliderGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  const [selectedId, setSelectedId] = useState<string>(COMPARISONS[0].id);
  const [position, setPosition] = useState<number>(START_POSITION);
  const current =
    COMPARISONS.find((c) => c.id === selectedId) ?? COMPARISONS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks4Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks4Intro}</p>
        </div>

        <div className="mt-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={selectedId}
            onValueChange={(value) => {
              if (value) {
                setSelectedId(value);
                setPosition(START_POSITION);
              }
            }}
            aria-label={gb.galleryBlocks4SelectExampleAria}
            className="flex-wrap"
          >
            {COMPARISONS.map((comparison) => (
              <ToggleGroupItem
                key={comparison.id}
                value={comparison.id}
                size="sm"
              >
                {gb[comparison.titleKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="border-border relative aspect-[3/2] overflow-hidden rounded-3xl border shadow-xs">
            <Image
              src={placeholderImage(current.afterSeed, "3x2")}
              alt={gb[current.afterAltKey]}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <Image
                src={placeholderImage(current.beforeSeed, "3x2")}
                alt={gb[current.beforeAltKey]}
                fill
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            </div>
            <span className="border-border bg-surface/90 absolute top-4 left-4 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              {gb.galleryBlocks4BeforeLabel}
            </span>
            <span className="text-brand-fg bg-brand/90 absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              {gb.galleryBlocks4AfterLabel}
            </span>
            <div
              aria-hidden="true"
              className="absolute inset-y-0 z-10"
              style={{ left: `${position}%` }}
            >
              <div className="border-border bg-bg absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 border shadow-sm" />
              <div className="border-border bg-bg absolute top-1/2 left-0 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm">
                <IconChevronLeft size={13} className="text-muted" />
                <IconChevronRight size={13} className="text-muted" />
              </div>
            </div>
          </div>
          <Slider
            value={[position]}
            onValueChange={(value) => setPosition(value[0])}
            max={100}
            step={1}
            className="mx-auto max-w-md"
          />
        </div>
      </div>
    </section>
  );
}
