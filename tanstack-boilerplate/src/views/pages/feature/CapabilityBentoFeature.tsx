"use client";

import Image from "next/image";
import {
  IconBolt,
  IconShieldCheck,
  IconStack,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILES = [
  {
    titleKey: "feature101Tile1Title",
    bodyKey: "feature101Tile1Body",
    imageAltKey: "feature101Tile1ImageAlt",
    icon: IconStack,
    panelClass: "lg:col-span-2 lg:row-span-2",
  },
  {
    titleKey: "feature101Tile2Title",
    bodyKey: "feature101Tile2Body",
    icon: IconUsersGroup,
    panelClass: "",
  },
  {
    titleKey: "feature101Tile3Title",
    bodyKey: "feature101Tile3Body",
    icon: IconBolt,
    panelClass: "",
  },
  {
    titleKey: "feature101Tile4Title",
    bodyKey: "feature101Tile4Body",
    imageAltKey: "feature101Tile4ImageAlt",
    icon: IconShieldCheck,
    panelClass: "lg:col-span-2",
  },
] as const;

const IMAGE_SRC: Record<string, string> = {
  big: "/img/placeholders/ph-4x3-6.webp",
  wide: "/img/placeholders/ph-4x3-1.webp",
  tall: "/img/placeholders/ph-4x5-6.webp",
} as const;

export function CapabilityBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature101Heading}
          </h2>
          <p className="text-muted">{f.feature101Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TILES.map((tile) => (
            <div
              key={tile.titleKey}
              className={`border-border bg-surface group flex flex-col gap-4 rounded-lg border p-6 ${tile.panelClass}`}
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
              {"imageAltKey" in tile ? (
                <div className="mt-auto overflow-hidden rounded-lg">
                  <Image
                    src={
                      IMAGE_SRC[
                        tile.panelClass === "lg:col-span-2 lg:row-span-2"
                          ? "big"
                          : "wide"
                      ]
                    }
                    alt={f[tile.imageAltKey]}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
            </div>
          ))}
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Image
              src={IMAGE_SRC.tall}
              alt={f.feature101Tile5ImageAlt}
              width={800}
              height={1000}
              className="aspect-[4/5] h-full w-full object-cover lg:aspect-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
