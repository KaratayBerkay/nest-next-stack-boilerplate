"use client";

import Image from "next/image";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  placeholderImage,
  type PlaceholderAspect,
} from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCategoriesMessages } from "@/types/pages/product-categories/ProductCategoriesMessages-types";

interface BentoTile {
  id: string;
  nameKey: string;
  subtextKey: string;
  seed: string;
  aspect: PlaceholderAspect;
  big?: boolean;
}

const TILES: BentoTile[] = [
  {
    id: "women",
    nameKey: "productCategories2Item1Name",
    subtextKey: "productCategories2Item1Subtext",
    seed: "pc2-women",
    aspect: "4x5",
    big: true,
  },
  {
    id: "men",
    nameKey: "productCategories2Item2Name",
    subtextKey: "productCategories2Item2Subtext",
    seed: "pc2-men",
    aspect: "1x1",
  },
  {
    id: "footwear",
    nameKey: "productCategories2Item3Name",
    subtextKey: "productCategories2Item3Subtext",
    seed: "pc2-footwear",
    aspect: "1x1",
  },
  {
    id: "accessories",
    nameKey: "productCategories2Item4Name",
    subtextKey: "productCategories2Item4Subtext",
    seed: "pc2-accessories",
    aspect: "1x1",
  },
  {
    id: "kids",
    nameKey: "productCategories2Item5Name",
    subtextKey: "productCategories2Item5Subtext",
    seed: "pc2-kids",
    aspect: "1x1",
  },
];

export function OverlayBentoGridProductCategories() {
  const t = useMessages("pages") as unknown as PagesWithProductCategoriesMessages;
  const pc = t.productCategories;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pc.productCategories2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pc.productCategories2Heading}
          </h2>
          <p className="text-muted">{pc.productCategories2Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2 sm:h-[560px]">
          {TILES.map((tile) => {
            const name = pc[tile.nameKey];
            return (
              <Link
                key={tile.id}
                href="#"
                className={
                  tile.big
                    ? "group relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full"
                    : "group relative aspect-square overflow-hidden rounded-3xl sm:aspect-auto sm:h-full"
                }
              >
                <Image
                  src={placeholderImage(tile.seed, tile.aspect)}
                  alt={name}
                  fill
                  sizes={
                    tile.big
                      ? "(min-width: 640px) 50vw, 100vw"
                      : "(min-width: 640px) 25vw, 50vw"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="from-fg/70 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5">
                  <span
                    className={
                      tile.big
                        ? "text-bg text-2xl font-medium tracking-tight sm:text-3xl"
                        : "text-bg text-base font-medium tracking-tight sm:text-lg"
                    }
                  >
                    {name}
                  </span>
                  <span className="text-bg/80 text-xs">
                    {pc[tile.subtextKey]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
