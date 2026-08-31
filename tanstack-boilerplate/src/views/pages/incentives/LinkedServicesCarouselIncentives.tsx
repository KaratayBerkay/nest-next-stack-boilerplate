"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface ServiceSlide {
  id: string;
  seed: string;
  titleKey: string;
  descKey: string;
  altKey: string;
}

const SLIDES: ServiceSlide[] = [
  {
    id: "design",
    seed: "incentives8-design",
    titleKey: "incentives8Item1Title",
    descKey: "incentives8Item1Desc",
    altKey: "incentives8Item1Alt",
  },
  {
    id: "install",
    seed: "incentives8-install",
    titleKey: "incentives8Item2Title",
    descKey: "incentives8Item2Desc",
    altKey: "incentives8Item2Alt",
  },
  {
    id: "warranty",
    seed: "incentives8-warranty",
    titleKey: "incentives8Item3Title",
    descKey: "incentives8Item3Desc",
    altKey: "incentives8Item3Alt",
  },
  {
    id: "support",
    seed: "incentives8-support",
    titleKey: "incentives8Item4Title",
    descKey: "incentives8Item4Desc",
    altKey: "incentives8Item4Alt",
  },
  {
    id: "financing",
    seed: "incentives8-financing",
    titleKey: "incentives8Item5Title",
    descKey: "incentives8Item5Desc",
    altKey: "incentives8Item5Alt",
  },
  {
    id: "eco",
    seed: "incentives8-eco",
    titleKey: "incentives8Item6Title",
    descKey: "incentives8Item6Desc",
    altKey: "incentives8Item6Alt",
  },
];

const CAROUSEL_OPTS = { align: "start", loop: true } as const;
const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
const LINK_URL = "#" as const;

export function LinkedServicesCarouselIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {t.incentives8Heading}
          </h2>
          <p className="text-muted">{t.incentives8Description}</p>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent className="gap-4 md:gap-6">
            {SLIDES.map((slide) => (
              <CarouselItem
                key={slide.id}
                className="sm:basis-1/2 lg:basis-1/3"
              >
                <a
                  href={LINK_URL}
                  className="border-border bg-bg group flex h-full flex-col overflow-hidden rounded-xl border shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
                >
                  <AspectRatio ratio={4 / 3} className="bg-surface relative">
                    <Image
                      src={placeholderImage(slide.seed, "4x3")}
                      alt={t[slide.altKey]}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-fg font-semibold">
                      {t[slide.titleKey]}
                    </h3>
                    <p className="text-muted line-clamp-2 text-sm">
                      {t[slide.descKey]}
                    </p>
                    <span className="text-brand mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium">
                      {t.incentives8LearnMore}
                      <IconArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={t.incentives8PrevAria} />
          <CarouselNext aria-label={t.incentives8NextAria} />
        </Carousel>
      </div>
    </section>
  );
}
