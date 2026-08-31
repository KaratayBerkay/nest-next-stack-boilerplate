"use client";

import { useRef } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

const SCROLL_STEP_PX = 320;

interface FilmFrame {
  id: string;
  seed: string;
  titleKey: string;
}

const FRAMES: FilmFrame[] = [
  { id: "departure-gate", seed: "gallery7-departure-gate", titleKey: "galleryBlocks7Frame1Title" },
  { id: "cloud-bank", seed: "gallery7-cloud-bank", titleKey: "galleryBlocks7Frame2Title" },
  { id: "runway-lights", seed: "gallery7-runway-lights", titleKey: "galleryBlocks7Frame3Title" },
  { id: "terminal-corridor", seed: "gallery7-terminal-corridor", titleKey: "galleryBlocks7Frame4Title" },
  { id: "baggage-claim", seed: "gallery7-baggage-claim", titleKey: "galleryBlocks7Frame5Title" },
  { id: "taxi-line", seed: "gallery7-taxi-line", titleKey: "galleryBlocks7Frame6Title" },
  { id: "skyline-descent", seed: "gallery7-skyline-descent", titleKey: "galleryBlocks7Frame7Title" },
  { id: "ground-crew", seed: "gallery7-ground-crew", titleKey: "galleryBlocks7Frame8Title" },
  { id: "arrivals-board", seed: "gallery7-arrivals-board", titleKey: "galleryBlocks7Frame9Title" },
  { id: "first-steps-outside", seed: "gallery7-first-steps-outside", titleKey: "galleryBlocks7Frame10Title" },
];

function Sprockets() {
  return (
    <div aria-hidden="true" className="flex justify-between px-3">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="bg-bg/70 size-2 rounded-[2px]" />
      ))}
    </div>
  );
}

export function HorizontalFilmstripGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;
  const stripRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const scrollByStep = (direction: 1 | -1) => {
    stripRef.current?.scrollBy({
      left: direction * SCROLL_STEP_PX,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">
              {gb.galleryBlocks7Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {gb.galleryBlocks7Heading}
            </h2>
            <p className="text-muted">{gb.galleryBlocks7Intro}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton
              icon={<IconChevronLeft size={16} />}
              label={gb.galleryBlocks7PrevAria}
              variant="outline"
              size="icon-sm"
              onClick={() => scrollByStep(-1)}
            />
            <IconButton
              icon={<IconChevronRight size={16} />}
              label={gb.galleryBlocks7NextAria}
              variant="outline"
              size="icon-sm"
              onClick={() => scrollByStep(1)}
            />
          </div>
        </div>

        <div
          ref={stripRef}
          role="list"
          aria-label={gb.galleryBlocks7StripAria}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {FRAMES.map((frame, index) => (
            <figure
              key={frame.id}
              role="listitem"
              className="bg-fg w-56 shrink-0 snap-center rounded-lg p-1.5 sm:w-64"
            >
              <Sprockets />
              <div className="relative mt-1.5 aspect-[3/2] overflow-hidden rounded-sm">
                <Image
                  src={placeholderImage(frame.seed, "3x2")}
                  alt={gb[frame.titleKey]}
                  fill
                  sizes="256px"
                  className="object-cover"
                />
                <span className="bg-bg/90 text-fg absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide tabular-nums">
                  {gb.galleryBlocks7FrameLabelTemplate.replace(
                    "{number}",
                    String(index + 1).padStart(2, "0"),
                  )}
                </span>
              </div>
              <Sprockets />
              <figcaption className="text-bg mt-1.5 px-1 pb-1 text-xs font-medium">
                {gb[frame.titleKey]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
