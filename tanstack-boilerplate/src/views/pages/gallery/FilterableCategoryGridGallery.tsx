"use client";

import { useState } from "react";
import Image from "next/image";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

type CategoryId = "architecture" | "nature" | "street" | "portrait";
type CategoryFilter = "all" | CategoryId;

interface CategoryPhoto {
  id: string;
  seed: string;
  category: CategoryId;
  titleKey: string;
}

const CATEGORY_LABEL_KEY: Record<CategoryId, string> = {
  architecture: "galleryBlocks3FilterArchitecture",
  nature: "galleryBlocks3FilterNature",
  street: "galleryBlocks3FilterStreet",
  portrait: "galleryBlocks3FilterPortrait",
};

const FILTERS: { id: CategoryFilter; labelKey: string }[] = [
  { id: "all", labelKey: "galleryBlocks3FilterAll" },
  { id: "architecture", labelKey: "galleryBlocks3FilterArchitecture" },
  { id: "nature", labelKey: "galleryBlocks3FilterNature" },
  { id: "street", labelKey: "galleryBlocks3FilterStreet" },
  { id: "portrait", labelKey: "galleryBlocks3FilterPortrait" },
];

const PHOTOS: CategoryPhoto[] = [
  {
    id: "glass-atrium",
    seed: "gallery3-glass-atrium",
    category: "architecture",
    titleKey: "galleryBlocks3Photo1Title",
  },
  {
    id: "spiral-stair",
    seed: "gallery3-spiral-stair",
    category: "architecture",
    titleKey: "galleryBlocks3Photo2Title",
  },
  {
    id: "concrete-facade",
    seed: "gallery3-concrete-facade",
    category: "architecture",
    titleKey: "galleryBlocks3Photo3Title",
  },
  {
    id: "fern-canopy",
    seed: "gallery3-fern-canopy",
    category: "nature",
    titleKey: "galleryBlocks3Photo4Title",
  },
  {
    id: "frosted-pine",
    seed: "gallery3-frosted-pine",
    category: "nature",
    titleKey: "galleryBlocks3Photo5Title",
  },
  {
    id: "tidal-flat",
    seed: "gallery3-tidal-flat",
    category: "nature",
    titleKey: "galleryBlocks3Photo6Title",
  },
  {
    id: "crosswalk-rush",
    seed: "gallery3-crosswalk-rush",
    category: "street",
    titleKey: "galleryBlocks3Photo7Title",
  },
  {
    id: "late-night-diner",
    seed: "gallery3-late-night-diner",
    category: "street",
    titleKey: "galleryBlocks3Photo8Title",
  },
  {
    id: "workshop-hands",
    seed: "gallery3-workshop-hands",
    category: "portrait",
    titleKey: "galleryBlocks3Photo9Title",
  },
  {
    id: "studio-profile",
    seed: "gallery3-studio-profile",
    category: "portrait",
    titleKey: "galleryBlocks3Photo10Title",
  },
];

export function FilterableCategoryGridGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered =
    category === "all"
      ? PHOTOS
      : PHOTOS.filter((photo) => photo.category === category);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks3Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks3Intro}</p>
        </div>

        <div className="mt-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) setCategory(value as CategoryFilter);
            }}
            aria-label={gb.galleryBlocks3FilterGroupAria}
            className="flex-wrap"
          >
            {FILTERS.map((filter) => (
              <ToggleGroupItem key={filter.id} value={filter.id} size="sm">
                {gb[filter.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div
          className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5"
          role="list"
          aria-label={gb.galleryBlocks3GridAria}
        >
          {filtered.map((photo) => (
            <figure key={photo.id} role="listitem" className="flex flex-col gap-2">
              <div className="border-border bg-surface relative aspect-[3/4] overflow-hidden rounded-xl border">
                <Image
                  src={placeholderImage(photo.seed, "3x4")}
                  alt={gb[photo.titleKey]}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex flex-col">
                <span className="text-fg text-sm font-semibold">
                  {gb[photo.titleKey]}
                </span>
                <span className="text-muted text-xs">
                  {gb[CATEGORY_LABEL_KEY[photo.category]]}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
