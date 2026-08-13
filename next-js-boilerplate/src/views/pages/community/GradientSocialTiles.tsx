"use client";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconChevronRight,
} from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

const DOT_GRID =
  "radial-gradient(color-mix(in srgb, var(--bg) 10%, transparent) 1px, transparent 1px)";

const TILES = [
  {
    icon: IconBrandFacebook,
    name: "Facebook",
    glow: "radial-gradient(circle 50% 50% at 50% 0%, color-mix(in srgb, var(--info) 35%, transparent), transparent 75%)",
    labelKey: "community4Tile1Label",
    descriptionKey: "community4Tile1Description",
  },
  {
    icon: IconBrandYoutube,
    name: "YouTube",
    glow: "radial-gradient(circle 50% 50% at 50% 0%, color-mix(in srgb, var(--error) 35%, transparent), transparent 75%)",
    labelKey: "community4Tile2Label",
    descriptionKey: "community4Tile2Description",
  },
  {
    icon: IconBrandX,
    name: "X",
    glow: "radial-gradient(circle 50% 50% at 50% 0%, color-mix(in srgb, var(--fg) 25%, transparent), transparent 75%)",
    labelKey: "community4Tile3Label",
    descriptionKey: "community4Tile3Description",
  },
  {
    icon: IconBrandInstagram,
    name: "Instagram",
    glow: "radial-gradient(circle 50% 50% at 50% 0%, color-mix(in srgb, var(--brand) 35%, transparent), transparent 75%)",
    labelKey: "community4Tile4Label",
    descriptionKey: "community4Tile4Description",
  },
];

export function GradientSocialTiles() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography variant="h2" className="text-4xl lg:text-5xl">
            {co.community4Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.community4Subtitle}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => (
            <a
              key={tile.name}
              href={LINK_URL}
              aria-label={co[tile.labelKey]}
              className="bg-fg text-bg group from-fg to-fg/80 relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-6"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ backgroundImage: tile.glow }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: DOT_GRID,
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="border-border/30 bg-bg/10 relative flex size-20 items-center justify-center rounded-full border">
                <tile.icon size={40} aria-hidden="true" />
              </div>
              <div className="relative flex flex-col gap-2">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {tile.name}
                </h3>
                <p className="text-bg/70 text-sm leading-6">
                  {co[tile.descriptionKey]}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium">
                  {co.community4Follow}
                  <IconChevronRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
