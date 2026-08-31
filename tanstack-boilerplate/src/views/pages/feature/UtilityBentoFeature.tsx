"use client";

import {
  IconBell,
  IconCommand,
  IconKeyboard,
  IconPlane,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    titleKey: "feature127Tile1Title",
    bodyKey: "feature127Tile1Body",
    icon: IconCommand,
    panelClass: "lg:col-span-2",
  },
  {
    titleKey: "feature127Tile2Title",
    bodyKey: "feature127Tile2Body",
    icon: IconUsers,
    panelClass: "lg:row-span-2",
  },
  {
    titleKey: "feature127Tile3Title",
    bodyKey: "feature127Tile3Body",
    icon: IconBell,
    panelClass: "",
  },
  {
    titleKey: "feature127Tile4Title",
    bodyKey: "feature127Tile4Body",
    icon: IconKeyboard,
    panelClass: "",
  },
  {
    titleKey: "feature127Tile5Title",
    bodyKey: "feature127Tile5Body",
    icon: IconPlane,
    panelClass: "lg:col-span-2",
  },
  {
    titleKey: "feature127Tile6Title",
    bodyKey: "feature127Tile6Body",
    icon: IconSettings,
    panelClass: "",
  },
] as const;

export function UtilityBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature127Heading}
          </h2>
          <p className="text-muted">{f.feature127Paragraph}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TILES.map((tile) => (
            <div
              key={tile.titleKey}
              className={`border-border bg-surface flex flex-col gap-4 rounded-lg border p-6 ${tile.panelClass}`}
            >
              <span className="border-border bg-bg text-fg inline-flex size-10 items-center justify-center rounded-md border">
                <tile.icon size={20} aria-hidden="true" />
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
