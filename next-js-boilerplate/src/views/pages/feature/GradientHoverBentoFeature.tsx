"use client";

import Image from "next/image";
import { IconBell, IconUpload } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    type: "image",
    titleKey: "feature116Tile1Title",
    bodyKey: "feature116Tile1Body",
    altKey: "feature116Tile1ImageAlt",
    className: "aspect-[16/10] lg:col-span-2",
    src: "https://picsum.photos/seed/feature116-overview/800/600",
  },
  {
    type: "copy",
    titleKey: "feature116Tile2Title",
    bodyKey: "feature116Tile2Body",
    Icon: IconBell,
    className: "",
  },
  {
    type: "image",
    titleKey: "feature116Tile3Title",
    bodyKey: "feature116Tile3Body",
    altKey: "feature116Tile3ImageAlt",
    className: "aspect-[16/10]",
    src: "https://picsum.photos/seed/feature116-offline/800/600",
  },
  {
    type: "copy",
    titleKey: "feature116Tile4Title",
    bodyKey: "feature116Tile4Body",
    Icon: IconUpload,
    className: "",
  },
  {
    type: "image",
    titleKey: "feature116Tile5Title",
    bodyKey: "feature116Tile5Body",
    altKey: "feature116Tile5ImageAlt",
    className: "aspect-[16/10]",
    src: "https://picsum.photos/seed/feature116-ship/800/600",
  },
] as const;

export function GradientHoverBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature116Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature116Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TILES.map((tile) =>
            tile.type === "image" ? (
              <div
                key={tile.titleKey}
                className={`border-border group relative overflow-hidden rounded-xl border ${tile.className}`}
              >
                <Image
                  src={tile.src}
                  alt={f[tile.altKey]}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="bg-brand/10 absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-fg text-lg font-semibold">
                      {f[tile.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f[tile.bodyKey]}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={tile.titleKey}
                className={`border-border bg-surface flex h-full flex-col gap-4 rounded-xl border p-6 ${tile.className}`}
              >
                <span className="bg-brand/10 text-brand-fg flex size-10 items-center justify-center rounded-lg">
                  <tile.Icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-lg font-semibold">
                    {f[tile.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[tile.bodyKey]}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
