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
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const CAROUSEL_OPTS = { align: "start", loop: false } as const;
const IMAGE_SIZES = "(max-width: 1024px) 80vw, 40vw";
const LINK_URL = "https://example.com" as const;

interface ScrollItem {
  titleKey: string;
  yearKey: string;
  blurbKey: string;
  altKey: string;
  imageSeed: string;
}

const ITEMS: ScrollItem[] = [
  {
    titleKey: "projects3Item1Title",
    yearKey: "projects3Item1Year",
    blurbKey: "projects3Item1Blurb",
    altKey: "projects3Item1Alt",
    imageSeed: "projects-scroll-1",
  },
  {
    titleKey: "projects3Item2Title",
    yearKey: "projects3Item2Year",
    blurbKey: "projects3Item2Blurb",
    altKey: "projects3Item2Alt",
    imageSeed: "projects-scroll-2",
  },
  {
    titleKey: "projects3Item3Title",
    yearKey: "projects3Item3Year",
    blurbKey: "projects3Item3Blurb",
    altKey: "projects3Item3Alt",
    imageSeed: "projects-scroll-3",
  },
  {
    titleKey: "projects3Item4Title",
    yearKey: "projects3Item4Year",
    blurbKey: "projects3Item4Blurb",
    altKey: "projects3Item4Alt",
    imageSeed: "projects-scroll-4",
  },
  {
    titleKey: "projects3Item5Title",
    yearKey: "projects3Item5Year",
    blurbKey: "projects3Item5Blurb",
    altKey: "projects3Item5Alt",
    imageSeed: "projects-scroll-5",
  },
  {
    titleKey: "projects3Item6Title",
    yearKey: "projects3Item6Year",
    blurbKey: "projects3Item6Blurb",
    altKey: "projects3Item6Alt",
    imageSeed: "projects-scroll-6",
  },
];

export function HorizontalScrollShowcaseProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <Carousel opts={CAROUSEL_OPTS}>
          <div className="mb-10 flex flex-col gap-4">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {pr.projects3Eyebrow}
            </span>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {pr.projects3Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-xl">
              {pr.projects3Intro}
            </Typography>
          </div>

          <CarouselContent className="gap-5">
            {ITEMS.map((item) => (
              <CarouselItem
                key={item.titleKey}
                className="basis-[85%] sm:basis-[55%] lg:basis-[38%]"
              >
                <a href={LINK_URL} className="group flex flex-col gap-4">
                  <AspectRatio
                    ratio={3 / 2}
                    className="bg-surface relative overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={placeholderImage(item.imageSeed, "3x2")}
                      alt={pr[item.altKey]}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="flex items-baseline justify-between gap-3">
                    <Typography
                      variant="h3"
                      className="text-fg text-lg font-medium tracking-tight"
                    >
                      {pr[item.titleKey]}
                    </Typography>
                    <span className="text-muted shrink-0 text-sm">
                      {pr[item.yearKey]}
                    </span>
                  </div>
                  <Typography variant="bodySmall" className="text-muted">
                    {pr[item.blurbKey]}
                  </Typography>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="relative mx-auto mt-8 h-9 w-24">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
