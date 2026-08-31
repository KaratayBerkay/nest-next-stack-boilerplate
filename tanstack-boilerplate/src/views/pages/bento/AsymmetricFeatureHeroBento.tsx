"use client";

import {
  IconArrowUpRight,
  IconBolt,
  IconChartBar,
  IconCloud,
  IconLock,
  IconRocket,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

const LINK_URL = "https://example.com" as const;

interface SmallTile {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const SMALL_TILES: SmallTile[] = [
  {
    id: "small-1",
    icon: IconBolt,
    titleKey: "bento1Tile1Title",
    bodyKey: "bento1Tile1Body",
  },
  {
    id: "small-2",
    icon: IconLock,
    titleKey: "bento1Tile2Title",
    bodyKey: "bento1Tile2Body",
  },
  {
    id: "small-3",
    icon: IconChartBar,
    titleKey: "bento1Tile3Title",
    bodyKey: "bento1Tile3Body",
  },
  {
    id: "small-4",
    icon: IconCloud,
    titleKey: "bento1Tile4Title",
    bodyKey: "bento1Tile4Body",
  },
];

export function AsymmetricFeatureHeroBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento1Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            variant="default"
            className="sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2"
          >
            <div className="flex h-full flex-col justify-between gap-6 p-6 @sm:p-8">
              <div className="flex flex-col gap-4">
                <span className="border-border bg-surface flex size-12 shrink-0 items-center justify-center rounded-xl border">
                  <IconRocket size={24} aria-hidden="true" className="text-brand" />
                </span>
                <Badge variant="soft" size="sm" className="w-fit">
                  {b.bento1HeroBadge}
                </Badge>
                <h3 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                  {b.bento1HeroTitle}
                </h3>
                <p className="text-muted leading-relaxed">{b.bento1HeroBody}</p>
              </div>
              <a
                href={LINK_URL}
                className="text-fg group inline-flex w-fit items-center gap-1.5 text-sm font-medium"
              >
                {b.bento1HeroCta}
                <IconArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </Card>

          {SMALL_TILES.map((tile) => (
            <Card key={tile.id} variant="default">
              <div className="flex h-full flex-col gap-3 p-5 @sm:p-6">
                <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <tile.icon size={18} aria-hidden="true" className="text-fg" />
                </span>
                <h3 className="text-fg text-sm font-semibold">{b[tile.titleKey]}</h3>
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
