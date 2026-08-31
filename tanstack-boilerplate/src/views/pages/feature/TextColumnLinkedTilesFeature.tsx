"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  { id: "docs", titleKey: "feature75Tile1Title" },
  { id: "api", titleKey: "feature75Tile2Title" },
  { id: "changelog", titleKey: "feature75Tile3Title" },
] as const;

export function TextColumnLinkedTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature75Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature75Body}</p>
          </div>
          <div className="flex flex-col gap-3">
            {TILES.map((tile) => (
              <Link
                key={tile.id}
                href="#"
                className="border-border bg-surface hover:border-brand/40 hover:bg-surface-hover group flex items-center justify-between rounded-lg border px-5 py-4 transition-colors"
              >
                <span className="text-fg text-sm font-medium">
                  {f[tile.titleKey]}
                </span>
                <IconArrowRight
                  size={16}
                  className="text-muted group-hover:text-brand shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
