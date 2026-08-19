"use client";

import {
  IconBolt,
  IconGlobe,
  IconLock,
  IconSettings,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    titleKey: "feature217bTile1Title",
    bodyKey: "feature217bTile1Body",
    icon: IconBolt,
  },
  {
    titleKey: "feature217bTile2Title",
    bodyKey: "feature217bTile2Body",
    icon: IconLock,
  },
  {
    titleKey: "feature217bTile3Title",
    bodyKey: "feature217bTile3Body",
    icon: IconGlobe,
  },
  {
    titleKey: "feature217bTile4Title",
    bodyKey: "feature217bTile4Body",
    icon: IconUsers,
  },
  {
    titleKey: "feature217bTile5Title",
    bodyKey: "feature217bTile5Body",
    icon: IconWallet,
  },
  {
    titleKey: "feature217bTile6Title",
    bodyKey: "feature217bTile6Body",
    icon: IconSettings,
  },
] as const;

export function FrostedTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="bg-surface-hover/50 w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature217bHeading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature217bIntro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <div
              key={tile.titleKey}
              className="border-border bg-surface/60 flex flex-col gap-4 rounded-xl p-6 shadow-sm backdrop-blur-md"
            >
              <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-lg">
                <tile.icon size={22} aria-hidden="true" />
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
          ))}
        </div>
      </div>
    </section>
  );
}
