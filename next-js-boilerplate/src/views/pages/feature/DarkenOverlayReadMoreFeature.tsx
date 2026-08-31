"use client";

import Image from "next/image";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    id: "insights",
    src: "/img/placeholders/ph-1x1-1.webp",
    titleKey: "feature81Tile1Title",
    altKey: "feature81Tile1ImageAlt",
  },
  {
    id: "workflows",
    src: "/img/placeholders/ph-1x1-3.webp",
    titleKey: "feature81Tile2Title",
    altKey: "feature81Tile2ImageAlt",
  },
  {
    id: "security",
    src: "/img/placeholders/ph-1x1-5.webp",
    titleKey: "feature81Tile3Title",
    altKey: "feature81Tile3ImageAlt",
  },
] as const;

export function DarkenOverlayReadMoreFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature81Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature81Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TILES.map((tile) => (
            <Link
              key={tile.id}
              href="#"
              className="group relative block overflow-hidden rounded-xl"
            >
              <Image
                src={tile.src}
                alt={f[tile.altKey]}
                width={480}
                height={480}
                className="aspect-square w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/65"
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-5">
                <h3 className="text-base font-semibold text-white">
                  {f[tile.titleKey]}
                </h3>
                <span className="text-sm font-medium text-white/80 underline-offset-4 group-hover:underline">
                  {f.feature81ReadMore}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
