"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/Carousel";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

interface SpotlightItem {
  titleKey: string;
  blurbKey: string;
  categoryKey: string;
  yearKey: string;
  altKey: string;
  imageSeed: string;
}

const ITEMS: SpotlightItem[] = [
  {
    titleKey: "projects8Item1Title",
    blurbKey: "projects8Item1Blurb",
    categoryKey: "projects8Item1Category",
    yearKey: "projects8Item1Year",
    altKey: "projects8Item1Alt",
    imageSeed: "projects-spotlight-1",
  },
  {
    titleKey: "projects8Item2Title",
    blurbKey: "projects8Item2Blurb",
    categoryKey: "projects8Item2Category",
    yearKey: "projects8Item2Year",
    altKey: "projects8Item2Alt",
    imageSeed: "projects-spotlight-2",
  },
  {
    titleKey: "projects8Item3Title",
    blurbKey: "projects8Item3Blurb",
    categoryKey: "projects8Item3Category",
    yearKey: "projects8Item3Year",
    altKey: "projects8Item3Alt",
    imageSeed: "projects-spotlight-3",
  },
  {
    titleKey: "projects8Item4Title",
    blurbKey: "projects8Item4Blurb",
    categoryKey: "projects8Item4Category",
    yearKey: "projects8Item4Year",
    altKey: "projects8Item4Alt",
    imageSeed: "projects-spotlight-4",
  },
];

function SpotlightDots({
  count,
  ariaTemplate,
}: {
  count: number;
  ariaTemplate: string;
}) {
  const { selectedIndex, scrollTo } = useCarousel();
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === selectedIndex;
        return (
          <button
            key={index}
            type="button"
            aria-label={ariaTemplate.replace("{n}", String(index + 1))}
            aria-current={isActive}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              isActive ? "bg-brand w-6" : "bg-border w-2",
            )}
          />
        );
      })}
    </div>
  );
}

export function ArrowCarouselSpotlightProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects8Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pr.projects8Intro}
          </Typography>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent>
            {ITEMS.map((item) => (
              <CarouselItem key={item.titleKey}>
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                  <AspectRatio
                    ratio={4 / 3}
                    className="bg-surface relative overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={placeholderImage(item.imageSeed, "4x3")}
                      alt={pr[item.altKey]}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </AspectRatio>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="soft" size="sm">
                        {pr[item.categoryKey]}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {pr[item.yearKey]}
                      </Badge>
                    </div>
                    <Typography
                      variant="h3"
                      className="text-fg text-2xl font-medium tracking-tight md:text-3xl"
                    >
                      {pr[item.titleKey]}
                    </Typography>
                    <Typography
                      variant="bodyLarge"
                      className="text-muted leading-relaxed"
                    >
                      {pr[item.blurbKey]}
                    </Typography>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-8 flex flex-col items-center gap-6">
            <SpotlightDots
              count={ITEMS.length}
              ariaTemplate={pr.projects8DotAriaTemplate}
            />
            <div className="relative h-9 w-24">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
