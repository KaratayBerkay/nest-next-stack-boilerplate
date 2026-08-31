"use client";

import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  { id: "product", titleKey: "feature50Tile1Title" },
  { id: "platform", titleKey: "feature50Tile2Title" },
  { id: "pricing", titleKey: "feature50Tile3Title" },
] as const;

export function CenteredPitchTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature50Heading}
        </h2>
        <p className="text-muted mt-4 leading-relaxed">{f.feature50Pitch}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-4 px-6 sm:grid-cols-3 lg:px-8">
        {TILES.map((tile) => (
          <Link
            key={tile.id}
            href="#"
            className="border-border bg-surface hover:border-brand/40 hover:bg-surface-hover group flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors"
          >
            <span className="text-fg text-sm font-semibold">
              {f[tile.titleKey]}
            </span>
            <IconArrowUpRight
              size={16}
              className="text-brand opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
