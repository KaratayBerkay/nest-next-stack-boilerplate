"use client";

import { IconBolt, IconGlobe, IconLock, IconWallet } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    titleKey: "feature15Tile1Title",
    bodyKey: "feature15Tile1Body",
    Icon: IconBolt,
  },
  {
    titleKey: "feature15Tile2Title",
    bodyKey: "feature15Tile2Body",
    Icon: IconLock,
  },
  {
    titleKey: "feature15Tile3Title",
    bodyKey: "feature15Tile3Body",
    Icon: IconGlobe,
  },
  {
    titleKey: "feature15Tile4Title",
    bodyKey: "feature15Tile4Body",
    Icon: IconWallet,
  },
] as const;

export function PairedIconTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature15Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature15Heading}
          </h2>
          <p className="text-muted">{f.feature15Description}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {TILES.map((tile) => (
            <div
              key={tile.titleKey}
              className="border-border bg-surface hover:bg-surface-hover flex flex-col items-start gap-4 rounded-lg border p-6 transition-colors"
            >
              <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-md">
                <tile.Icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-base font-semibold">
                  {f[tile.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[tile.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
