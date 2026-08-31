"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight, IconMaximize } from "@tabler/icons-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

interface LightboxPhoto {
  id: string;
  seed: string;
  titleKey: string;
  captionKey: string;
}

const PHOTOS: LightboxPhoto[] = [
  {
    id: "studio-still-life",
    seed: "gallery2-studio-still-life",
    titleKey: "galleryBlocks2Photo1Title",
    captionKey: "galleryBlocks2Photo1Caption",
  },
  {
    id: "desert-bloom",
    seed: "gallery2-desert-bloom",
    titleKey: "galleryBlocks2Photo2Title",
    captionKey: "galleryBlocks2Photo2Caption",
  },
  {
    id: "city-grid",
    seed: "gallery2-city-grid",
    titleKey: "galleryBlocks2Photo3Title",
    captionKey: "galleryBlocks2Photo3Caption",
  },
  {
    id: "tidepool-detail",
    seed: "gallery2-tidepool-detail",
    titleKey: "galleryBlocks2Photo4Title",
    captionKey: "galleryBlocks2Photo4Caption",
  },
  {
    id: "vintage-type",
    seed: "gallery2-vintage-type",
    titleKey: "galleryBlocks2Photo5Title",
    captionKey: "galleryBlocks2Photo5Caption",
  },
  {
    id: "foggy-pier",
    seed: "gallery2-foggy-pier",
    titleKey: "galleryBlocks2Photo6Title",
    captionKey: "galleryBlocks2Photo6Caption",
  },
  {
    id: "market-spices",
    seed: "gallery2-market-spices",
    titleKey: "galleryBlocks2Photo7Title",
    captionKey: "galleryBlocks2Photo7Caption",
  },
  {
    id: "night-train",
    seed: "gallery2-night-train",
    titleKey: "galleryBlocks2Photo8Title",
    captionKey: "galleryBlocks2Photo8Caption",
  },
];

export function LightboxGridGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const current = PHOTOS[activeIndex];

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % PHOTOS.length);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks2Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks2Intro}</p>
        </div>

        <div
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label={gb.galleryBlocks2GridAria}
        >
          {PHOTOS.map((photo, index) => (
            <div key={photo.id} role="listitem">
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setOpen(true);
                }}
                aria-label={gb.galleryBlocks2OpenAriaTemplate.replace(
                  "{title}",
                  gb[photo.titleKey],
                )}
                className="focus-visible:ring-brand group border-border bg-surface relative block aspect-square w-full overflow-hidden rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
              >
                <Image
                  src={placeholderImage(photo.seed, "1x1")}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="bg-overlay/0 group-hover:bg-overlay/30 absolute inset-0 flex items-center justify-center transition-colors">
                  <span className="bg-bg/90 flex size-9 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                    <IconMaximize size={16} aria-hidden="true" className="text-fg" />
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" closeLabel={gb.galleryBlocks2CloseLabel}>
          <DialogHeader>
            <DialogTitle>{gb[current.titleKey]}</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="bg-surface relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src={placeholderImage(current.seed, "4x3")}
                alt={gb[current.titleKey]}
                fill
                sizes="(min-width: 640px) 640px, 100vw"
                className="object-cover"
              />
              <IconButton
                icon={<IconChevronLeft size={16} />}
                label={gb.galleryBlocks2PrevAria}
                variant="outline"
                size="icon-sm"
                onClick={goPrev}
                className="bg-bg/80 absolute top-1/2 left-3 -translate-y-1/2 backdrop-blur-sm"
              />
              <IconButton
                icon={<IconChevronRight size={16} />}
                label={gb.galleryBlocks2NextAria}
                variant="outline"
                size="icon-sm"
                onClick={goNext}
                className="bg-bg/80 absolute top-1/2 right-3 -translate-y-1/2 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-fg text-sm leading-relaxed">
                {gb[current.captionKey]}
              </p>
              <span className="text-muted shrink-0 text-xs tabular-nums">
                {gb.galleryBlocks2CounterTemplate
                  .replace("{current}", String(activeIndex + 1))
                  .replace("{total}", String(PHOTOS.length))}
              </span>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
