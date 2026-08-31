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
  CaseStudy10Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const CAROUSEL_OPTS = { align: "start" } as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const ITEMS: CaseStudy10Item[] = [
  {
    categoryKey: "caseStudy10Item1Category",
    titleKey: "caseStudy10Item1Title",
    descriptionKey: "caseStudy10Item1Description",
    altKey: "caseStudy10Item1Alt",
    imageSeed: "case-study-10-1",
  },
  {
    categoryKey: "caseStudy10Item2Category",
    titleKey: "caseStudy10Item2Title",
    descriptionKey: "caseStudy10Item2Description",
    altKey: "caseStudy10Item2Alt",
    imageSeed: "case-study-10-2",
  },
  {
    categoryKey: "caseStudy10Item3Category",
    titleKey: "caseStudy10Item3Title",
    descriptionKey: "caseStudy10Item3Description",
    altKey: "caseStudy10Item3Alt",
    imageSeed: "case-study-10-3",
  },
  {
    categoryKey: "caseStudy10Item4Category",
    titleKey: "caseStudy10Item4Title",
    descriptionKey: "caseStudy10Item4Description",
    altKey: "caseStudy10Item4Alt",
    imageSeed: "case-study-10-4",
  },
  {
    categoryKey: "caseStudy10Item5Category",
    titleKey: "caseStudy10Item5Title",
    descriptionKey: "caseStudy10Item5Description",
    altKey: "caseStudy10Item5Alt",
    imageSeed: "case-study-10-5",
  },
  {
    categoryKey: "caseStudy10Item6Category",
    titleKey: "caseStudy10Item6Title",
    descriptionKey: "caseStudy10Item6Description",
    altKey: "caseStudy10Item6Alt",
    imageSeed: "case-study-10-6",
  },
];

export function MaskedTwoUpCarousel() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cs.caseStudy10Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cs.caseStudy10Description}
          </Typography>
        </div>
        <Carousel opts={CAROUSEL_OPTS}>
          <div className="relative">
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
                        src={placeholderImage(item.imageSeed, "3x2")}
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
            <CarouselPrevious />
            <CarouselNext />
            <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r to-transparent" />
            <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
