"use client";

import Image from "next/image";
import {
  IconBolt,
  IconChartBar,
  IconGlobe,
  IconHeadset,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const COPY_TILE_CLASS =
  "border-border bg-surface flex flex-col justify-center gap-3 rounded-xl border p-6" as const;
const IMAGE_TILE_CLASS =
  "border-border bg-surface group relative overflow-hidden rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg" as const;

const TILES = [
  {
    kind: "image",
    titleKey: "feature202Tile1Title",
    bodyKey: "feature202Tile1Body",
    altKey: "feature202Tile1ImageAlt",
    icon: IconUsers,
    spanClass: "lg:col-span-2",
    src: "https://picsum.photos/seed/feature202-tile1/800/600",
  },
  {
    kind: "copy",
    titleKey: "feature202Tile2Title",
    bodyKey: "feature202Tile2Body",
    icon: IconShield,
    spanClass: "",
  },
  {
    kind: "image",
    titleKey: "feature202Tile3Title",
    bodyKey: "feature202Tile3Body",
    altKey: "feature202Tile3ImageAlt",
    icon: IconGlobe,
    spanClass: "",
    src: "https://picsum.photos/seed/feature202-tile3/800/600",
  },
  {
    kind: "copy",
    titleKey: "feature202Tile4Title",
    bodyKey: "feature202Tile4Body",
    icon: IconBolt,
    spanClass: "",
  },
  {
    kind: "image",
    titleKey: "feature202Tile5Title",
    bodyKey: "feature202Tile5Body",
    altKey: "feature202Tile5ImageAlt",
    icon: IconChartBar,
    spanClass: "lg:col-span-2",
    src: "https://picsum.photos/seed/feature202-tile5/800/600",
  },
  {
    kind: "copy",
    titleKey: "feature202Tile6Title",
    bodyKey: "feature202Tile6Body",
    icon: IconHeadset,
    spanClass: "",
  },
] as const;

export function SolutionTilesBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature202Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature202Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {TILES.map((tile) => {
            const badge = (
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
                <tile.icon size={20} aria-hidden="true" />
              </span>
            );
            if (tile.kind === "image") {
              return (
                <div
                  key={tile.titleKey}
                  className={`${IMAGE_TILE_CLASS} aspect-[16/9] lg:aspect-auto lg:min-h-56 ${tile.spanClass}`}
                >
                  <Image
                    src={tile.src}
                    alt={f[tile.altKey]}
                    width={800}
                    height={600}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    className="bg-surface-hover absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-80"
                    aria-hidden="true"
                  />
                  <div className="relative flex h-full flex-col justify-end gap-3 p-6">
                    <span className="bg-brand text-brand-fg inline-flex w-fit items-center justify-center rounded-md p-2">
                      <tile.icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="text-fg text-lg font-semibold">
                      {f[tile.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f[tile.bodyKey]}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={tile.titleKey}
                className={`${COPY_TILE_CLASS} ${tile.spanClass}`}
              >
                {badge}
                <h3 className="text-fg text-lg font-semibold">
                  {f[tile.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[tile.bodyKey]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
