"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy8Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const CAROUSEL_OPTS = { align: "start", slidesToScroll: 1 } as const;
const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

const ITEMS: CaseStudy8Item[] = [
  {
    categoryKey: "caseStudy8Item1Category",
    titleKey: "caseStudy8Item1Title",
    descriptionKey: "caseStudy8Item1Description",
    altKey: "caseStudy8Item1Alt",
    imageSeed: "case-study-8-1",
  },
  {
    categoryKey: "caseStudy8Item2Category",
    titleKey: "caseStudy8Item2Title",
    descriptionKey: "caseStudy8Item2Description",
    altKey: "caseStudy8Item2Alt",
    imageSeed: "case-study-8-2",
  },
  {
    categoryKey: "caseStudy8Item3Category",
    titleKey: "caseStudy8Item3Title",
    descriptionKey: "caseStudy8Item3Description",
    altKey: "caseStudy8Item3Alt",
    imageSeed: "case-study-8-3",
  },
  {
    categoryKey: "caseStudy8Item4Category",
    titleKey: "caseStudy8Item4Title",
    descriptionKey: "caseStudy8Item4Description",
    altKey: "caseStudy8Item4Alt",
    imageSeed: "case-study-8-4",
  },
  {
    categoryKey: "caseStudy8Item5Category",
    titleKey: "caseStudy8Item5Title",
    descriptionKey: "caseStudy8Item5Description",
    altKey: "caseStudy8Item5Alt",
    imageSeed: "case-study-8-5",
  },
  {
    categoryKey: "caseStudy8Item6Category",
    titleKey: "caseStudy8Item6Title",
    descriptionKey: "caseStudy8Item6Description",
    altKey: "caseStudy8Item6Alt",
    imageSeed: "case-study-8-6",
  },
];

export function SteppingThreeUpCarousel() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <Carousel opts={CAROUSEL_OPTS}>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div className="flex max-w-2xl flex-col gap-4">
              <Typography
                variant="h2"
                className="text-3xl font-medium tracking-tighter md:text-4xl"
              >
                {cs.caseStudy8Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {cs.caseStudy8Description}
              </Typography>
            </div>
            <div className="relative h-8 w-24 shrink-0">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
          <CarouselContent className="gap-4 md:gap-6">
            {ITEMS.map((item) => (
              <CarouselItem
                key={item.titleKey}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <article className="border-border bg-surface group flex h-full flex-col overflow-hidden rounded-2xl border">
                  <AspectRatio
                    ratio={16 / 9}
                    className="bg-surface relative overflow-hidden"
                  >
                    <Image
                      src={`https://picsum.photos/seed/${item.imageSeed}/800/450`}
                      alt={cs[item.altKey]}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                      {cs[item.categoryKey]}
                    </span>
                    <Typography
                      variant="h3"
                      className="text-lg font-medium tracking-tight"
                    >
                      {cs[item.titleKey]}
                    </Typography>
                    <Typography
                      variant="bodySmall"
                      className="text-muted line-clamp-1"
                    >
                      {cs[item.descriptionKey]}
                    </Typography>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
