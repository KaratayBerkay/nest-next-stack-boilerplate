"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    titleKey: "feature225Tile1Title",
    bodyKey: "feature225Tile1Body",
    previewTitleKey: "feature225Preview1Title",
    previewBodyKey: "feature225Preview1Body",
    imageAltKey: "feature225Preview1ImageAlt",
    src: "/img/placeholders/ph-4x3-4.webp",
  },
  {
    titleKey: "feature225Tile2Title",
    bodyKey: "feature225Tile2Body",
    previewTitleKey: "feature225Preview2Title",
    previewBodyKey: "feature225Preview2Body",
    imageAltKey: "feature225Preview2ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
  {
    titleKey: "feature225Tile3Title",
    bodyKey: "feature225Tile3Body",
    previewTitleKey: "feature225Preview3Title",
    previewBodyKey: "feature225Preview3Body",
    imageAltKey: "feature225Preview3ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
] as const;

function handleTileSelect(
  index: number,
  setActiveIndex: Dispatch<SetStateAction<number>>,
) {
  setActiveIndex(index);
}

export function CapabilityTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTile = TILES[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature225Heading}
          </h2>
          <p className="text-muted">{f.feature225Intro}</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-3">
            {TILES.map((tile, index) => (
              <button
                key={tile.titleKey}
                type="button"
                aria-pressed={index === activeIndex}
                onClick={() => handleTileSelect(index, setActiveIndex)}
                className={`flex flex-col gap-1.5 rounded-lg border p-5 text-left transition-colors ${
                  index === activeIndex
                    ? "border-brand bg-brand/5"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <span className="text-fg text-base font-semibold">
                  {f[tile.titleKey]}
                </span>
                <span className="text-muted text-sm leading-relaxed">
                  {f[tile.bodyKey]}
                </span>
              </button>
            ))}
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Image
              key={activeIndex}
              src={activeTile.src}
              alt={f[activeTile.imageAltKey]}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex flex-col gap-2 p-6">
              <h3 className="text-fg text-lg font-semibold">
                {f[activeTile.previewTitleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[activeTile.previewBodyKey]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
