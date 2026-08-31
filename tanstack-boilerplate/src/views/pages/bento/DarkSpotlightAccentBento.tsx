"use client";

import {
  IconArrowRight,
  IconChartBar,
  IconClock,
  IconLock,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

const LINK_URL = "https://example.com" as const;

interface LightTile {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const LIGHT_TILES: LightTile[] = [
  {
    id: "light-1",
    icon: IconChartBar,
    titleKey: "bento5Tile1Title",
    bodyKey: "bento5Tile1Body",
  },
  {
    id: "light-2",
    icon: IconUsers,
    titleKey: "bento5Tile2Title",
    bodyKey: "bento5Tile2Body",
  },
  {
    id: "light-3",
    icon: IconClock,
    titleKey: "bento5Tile3Title",
    bodyKey: "bento5Tile3Body",
  },
  {
    id: "light-4",
    icon: IconLock,
    titleKey: "bento5Tile4Title",
    bodyKey: "bento5Tile4Body",
  },
];

export function DarkSpotlightAccentBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento5Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={LINK_URL}
            className="bg-fg text-bg group relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2 @sm:p-8"
          >
            <div
              aria-hidden="true"
              className="bg-brand/25 absolute -top-10 -right-10 size-40 rounded-full blur-3xl"
            />
            <span className="border-bg/20 bg-bg/10 relative flex size-11 shrink-0 items-center justify-center rounded-lg border">
              <IconSparkles size={20} aria-hidden="true" />
            </span>
            <div className="relative flex flex-col gap-3">
              <h3 className="text-xl font-semibold tracking-tight lg:text-2xl">
                {b.bento5SpotlightTitle}
              </h3>
              <p className="text-bg/70 text-sm leading-relaxed">
                {b.bento5SpotlightBody}
              </p>
              <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium">
                {b.bento5SpotlightCta}
                <IconArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </div>
          </a>

          {LIGHT_TILES.map((tile) => (
            <Card key={tile.id} variant="default">
              <div className="flex h-full flex-col gap-3 p-5 @sm:p-6">
                <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <tile.icon size={18} aria-hidden="true" className="text-fg" />
                </span>
                <h3 className="text-fg text-sm font-semibold">
                  {b[tile.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {b[tile.bodyKey]}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
