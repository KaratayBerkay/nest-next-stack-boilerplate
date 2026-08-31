"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

const SERVICES = [
  {
    id: "strategy",
    src: "/img/placeholders/ph-4x5-0.webp",
    titleKey: "feature240Service1Title",
    altKey: "feature240Service1ImageAlt",
  },
  {
    id: "design",
    src: "/img/placeholders/ph-4x5-2.webp",
    titleKey: "feature240Service2Title",
    altKey: "feature240Service2ImageAlt",
  },
  {
    id: "build",
    src: "/img/placeholders/ph-4x5-4.webp",
    titleKey: "feature240Service3Title",
    altKey: "feature240Service3ImageAlt",
  },
  {
    id: "support",
    src: "/img/placeholders/ph-4x5-6.webp",
    titleKey: "feature240Service4Title",
    altKey: "feature240Service4ImageAlt",
  },
] as const;

export function ServicesHoverCarouselFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature240Heading}
            </h2>
            <p className="text-muted">{f.feature240Intro}</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <CarouselPrevious
              aria-label={f.feature240PrevAria}
              className="static translate-y-0"
            />
            <CarouselNext
              aria-label={f.feature240NextAria}
              className="static translate-y-0"
            />
          </div>
        </div>
        <div className="mt-12">
          <Carousel opts={CAROUSEL_OPTS}>
            <CarouselContent>
              {SERVICES.map((service) => (
                <CarouselItem
                  key={service.id}
                  className="sm:basis-1/2 lg:basis-1/4"
                >
                  <div className="group border-border relative overflow-hidden rounded-xl border">
                    <Image
                      src={service.src}
                      alt={f[service.altKey]}
                      width={480}
                      height={600}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                    />
                    <h3 className="absolute inset-x-0 bottom-0 p-4 text-base font-semibold text-white">
                      {f[service.titleKey]}
                    </h3>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
