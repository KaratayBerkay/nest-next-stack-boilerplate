"use client";

import Image from "next/image";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const TILES = [
  {
    titleKey: "feature182Tile1Title",
    altKey: "feature182Tile1ImageAlt",
    linkLabelKey: "feature182Tile1LinkLabel",
    buttonAriaKey: "feature182Tile1ButtonAria",
    src: "https://picsum.photos/seed/feature182-1/800/600",
  },
  {
    titleKey: "feature182Tile2Title",
    altKey: "feature182Tile2ImageAlt",
    linkLabelKey: "feature182Tile2LinkLabel",
    buttonAriaKey: "feature182Tile2ButtonAria",
    src: "https://picsum.photos/seed/feature182-2/800/600",
  },
  {
    titleKey: "feature182Tile3Title",
    altKey: "feature182Tile3ImageAlt",
    linkLabelKey: "feature182Tile3LinkLabel",
    buttonAriaKey: "feature182Tile3ButtonAria",
    src: "https://picsum.photos/seed/feature182-3/800/600",
  },
] as const;

export function ImageTilesDualActionsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature182Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature182Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TILES.map((tile) => (
            <article
              key={tile.titleKey}
              className="border-border bg-surface group flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={tile.src}
                  alt={f[tile.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <h3 className="text-fg text-lg font-semibold">
                  {f[tile.titleKey]}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <a
                    href={LINK_URL}
                    className="text-fg inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    {f[tile.linkLabelKey]}
                    <IconArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                  <button
                    type="button"
                    aria-label={f[tile.buttonAriaKey]}
                    className="border-border bg-bg text-fg hover:bg-surface-hover flex size-9 items-center justify-center rounded-full border transition-colors"
                  >
                    <IconArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
