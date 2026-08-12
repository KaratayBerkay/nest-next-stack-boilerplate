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
  CaseStudy9Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const CAROUSEL_OPTS = { align: "start" } as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const ITEMS: CaseStudy9Item[] = [
  {
    categoryKey: "caseStudy9Item1Category",
    titleKey: "caseStudy9Item1Title",
    descriptionKey: "caseStudy9Item1Description",
    altKey: "caseStudy9Item1Alt",
    imageSeed: "case-study-9-1",
  },
  {
    categoryKey: "caseStudy9Item2Category",
    titleKey: "caseStudy9Item2Title",
    descriptionKey: "caseStudy9Item2Description",
    altKey: "caseStudy9Item2Alt",
    imageSeed: "case-study-9-2",
  },
  {
    categoryKey: "caseStudy9Item3Category",
    titleKey: "caseStudy9Item3Title",
    descriptionKey: "caseStudy9Item3Description",
    altKey: "caseStudy9Item3Alt",
    imageSeed: "case-study-9-3",
  },
  {
    categoryKey: "caseStudy9Item4Category",
    titleKey: "caseStudy9Item4Title",
    descriptionKey: "caseStudy9Item4Description",
    altKey: "caseStudy9Item4Alt",
    imageSeed: "case-study-9-4",
  },
  {
    categoryKey: "caseStudy9Item5Category",
    titleKey: "caseStudy9Item5Title",
    descriptionKey: "caseStudy9Item5Description",
    altKey: "caseStudy9Item5Alt",
    imageSeed: "case-study-9-5",
  },
  {
    categoryKey: "caseStudy9Item6Category",
    titleKey: "caseStudy9Item6Title",
    descriptionKey: "caseStudy9Item6Description",
    altKey: "caseStudy9Item6Alt",
    imageSeed: "case-study-9-6",
  },
];

export function TwoUpLandscapeCarousel() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <Carousel opts={CAROUSEL_OPTS}>
          <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {cs.caseStudy9Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cs.caseStudy9Description}
            </Typography>
          </div>
          <CarouselContent className="gap-4 md:gap-6">
            {ITEMS.map((item) => (
              <CarouselItem
                key={item.titleKey}
                className="basis-full lg:basis-1/2"
              >
                <article className="border-border bg-surface group flex h-full flex-col overflow-hidden rounded-2xl border">
                  <AspectRatio
                    ratio={16 / 10}
                    className="bg-surface relative overflow-hidden"
                  >
                    <Image
                      src={`https://picsum.photos/seed/${item.imageSeed}/800/500`}
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
                      className="text-muted line-clamp-2"
                    >
                      {cs[item.descriptionKey]}
                    </Typography>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="relative mx-auto mt-8 h-8 w-24">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
