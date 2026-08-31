"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Slide {
  altKey: string;
  imageSeed: string;
}

const SLIDES: Slide[] = [
  { altKey: "project2Slide1Alt", imageSeed: "project-gallery-1" },
  { altKey: "project2Slide2Alt", imageSeed: "project-gallery-2" },
  { altKey: "project2Slide3Alt", imageSeed: "project-gallery-3" },
  { altKey: "project2Slide4Alt", imageSeed: "project-gallery-4" },
];

const STACK_KEYS = [
  "project2Stack1",
  "project2Stack2",
  "project2Stack3",
  "project2Stack4",
] as const;

function OverlayPanel({ p }: { p: PagesWithProjectMessages["project"] }) {
  const { selectedIndex } = useCarousel();
  const counter = p.project2SlideCounterLabel
    .replace("{current}", String(selectedIndex + 1))
    .replace("{total}", String(SLIDES.length));

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-8">
      <div className="bg-bg/85 border-border pointer-events-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-5 shadow-lg backdrop-blur-md sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="soft">{p.project2ClientValue}</Badge>
          <span className="text-muted text-xs tabular-nums">{counter}</span>
        </div>
        <h1 className="text-fg text-2xl font-semibold tracking-tight">
          {p.project2Title}
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          {p.project2Tagline}
        </p>
      </div>
    </div>
  );
}

export function GalleryOverlayProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <Carousel className="border-border overflow-hidden rounded-2xl border">
          <div className="relative">
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem key={slide.altKey}>
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={placeholderImage(slide.imageSeed, "16x9")}
                      alt={p[slide.altKey]}
                      fill
                      sizes="(max-width: 1024px) 100vw, 80vw"
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <OverlayPanel p={p} />
          </div>
        </Carousel>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h2 className="text-fg text-xl font-semibold">
              {p.project2DescriptionHeading}
            </h2>
            <p className="text-muted leading-relaxed">
              {p.project2Description}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted text-xs">{p.project2YearLabel}</span>
              <span className="text-fg font-medium">{p.project2YearValue}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STACK_KEYS.map((key) => (
                <Badge key={key} variant="secondary">
                  {p[key]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
