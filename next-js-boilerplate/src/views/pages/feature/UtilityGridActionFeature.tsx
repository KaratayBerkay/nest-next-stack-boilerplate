"use client";

import {
  IconArrowUpRight,
  IconBell,
  IconDownload,
  IconFolder,
  IconLock,
  IconPuzzle,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface UtilityTile {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const LINK_URL = "#" as const;

const UTILITY_TILES: UtilityTile[] = [
  {
    id: "search",
    icon: IconSearch,
    titleKey: "feature148Tile1Title",
    bodyKey: "feature148Tile1Body",
  },
  {
    id: "folders",
    icon: IconFolder,
    titleKey: "feature148Tile2Title",
    bodyKey: "feature148Tile2Body",
  },
  {
    id: "alerts",
    icon: IconBell,
    titleKey: "feature148Tile3Title",
    bodyKey: "feature148Tile3Body",
  },
  {
    id: "security",
    icon: IconLock,
    titleKey: "feature148Tile4Title",
    bodyKey: "feature148Tile4Body",
  },
  {
    id: "export",
    icon: IconDownload,
    titleKey: "feature148Tile5Title",
    bodyKey: "feature148Tile5Body",
  },
  {
    id: "plugins",
    icon: IconPuzzle,
    titleKey: "feature148Tile6Title",
    bodyKey: "feature148Tile6Body",
  },
];

export function UtilityGridActionFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col items-start gap-4">
            <span className="text-brand text-sm font-semibold tracking-widest uppercase">
              {f.feature148Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature148Heading}
            </h2>
            <p className="text-muted">{f.feature148Paragraph}</p>
          </div>
          <Button asChild className="shrink-0">
            <a href={LINK_URL}>
              {f.feature148CtaLabel}
              <IconArrowUpRight size={16} aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UTILITY_TILES.map((tile) => (
            <div
              key={tile.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-md">
                <tile.icon size={20} aria-hidden="true" />
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
