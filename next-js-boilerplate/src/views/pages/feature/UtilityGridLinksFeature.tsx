"use client";

import {
  IconArrowUpRight,
  IconBell,
  IconCopy,
  IconDownload,
  IconFileText,
  IconHistory,
  IconKeyboard,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const TILE_CLASS =
  "border-border bg-surface hover:bg-surface-hover rounded-lg border border-dashed p-6 transition-colors" as const;
const ICON_BOX_CLASS =
  "bg-brand text-brand-fg mb-4 flex size-11 items-center justify-center rounded-md" as const;

const TILES = [
  {
    titleKey: "feature20Tile1Title",
    bodyKey: "feature20Tile1Body",
    Icon: IconFileText,
  },
  {
    titleKey: "feature20Tile2Title",
    bodyKey: "feature20Tile2Body",
    Icon: IconCopy,
  },
  {
    titleKey: "feature20Tile3Title",
    bodyKey: "feature20Tile3Body",
    Icon: IconKeyboard,
  },
  {
    titleKey: "feature20Tile4Title",
    bodyKey: "feature20Tile4Body",
    Icon: IconBell,
  },
  {
    titleKey: "feature20Tile5Title",
    bodyKey: "feature20Tile5Body",
    Icon: IconHistory,
  },
  {
    titleKey: "feature20Tile6Title",
    bodyKey: "feature20Tile6Body",
    Icon: IconDownload,
  },
] as const;

export function UtilityGridLinksFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature20Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature20Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature20Paragraph}</p>
          <a
            href={LINK_URL}
            className="text-brand group inline-flex items-center gap-1.5 pt-1 text-sm font-medium"
          >
            {f.feature20LearnMore}
            <IconArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <div key={tile.titleKey} className={TILE_CLASS}>
              <span className={ICON_BOX_CLASS}>
                <tile.Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[tile.titleKey]}
              </h3>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">
                {f[tile.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
