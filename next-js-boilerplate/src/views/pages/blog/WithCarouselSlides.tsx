"use client";

import Image from "next/image";
import { IconArrowUpRight, IconCalendar } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
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
  Blog21Slide,
  BlogMessages,
} from "@/types/pages/blog/WithCarouselSlides-types";

const BLOG21_SLIDES: Blog21Slide[] = [
  {
    src: "https://picsum.photos/seed/blog21-1/800/600",
    titleKey: "blog21Post1Title",
    excerptKey: "blog21Post1Excerpt",
    categoryKey: "blog21Post1Category",
    dateKey: "blog21Post1Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-2/800/600",
    titleKey: "blog21Post2Title",
    excerptKey: "blog21Post2Excerpt",
    categoryKey: "blog21Post2Category",
    dateKey: "blog21Post2Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-3/800/600",
    titleKey: "blog21Post3Title",
    excerptKey: "blog21Post3Excerpt",
    categoryKey: "blog21Post3Category",
    dateKey: "blog21Post3Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-4/800/600",
    titleKey: "blog21Post4Title",
    excerptKey: "blog21Post4Excerpt",
    categoryKey: "blog21Post4Category",
    dateKey: "blog21Post4Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-5/800/600",
    titleKey: "blog21Post5Title",
    excerptKey: "blog21Post5Excerpt",
    categoryKey: "blog21Post5Category",
    dateKey: "blog21Post5Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-6/800/600",
    titleKey: "blog21Post6Title",
    excerptKey: "blog21Post6Excerpt",
    categoryKey: "blog21Post6Category",
    dateKey: "blog21Post6Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-7/800/600",
    titleKey: "blog21Post7Title",
    excerptKey: "blog21Post7Excerpt",
    categoryKey: "blog21Post7Category",
    dateKey: "blog21Post7Date",
  },
  {
    src: "https://picsum.photos/seed/blog21-8/800/600",
    titleKey: "blog21Post8Title",
    excerptKey: "blog21Post8Excerpt",
    categoryKey: "blog21Post8Category",
    dateKey: "blog21Post8Date",
  },
];

const CAROUSEL_OPTS = { align: "start", loop: true } as const;
const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
const POST_URL = "https://example.com" as const;

function Blog21Card({ slide, t }: { slide: Blog21Slide; t: BlogMessages }) {
  return (
    <a
      href={POST_URL}
      className="border-border bg-bg group flex h-full flex-col overflow-hidden rounded-xl border shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <AspectRatio ratio={4 / 3} className="bg-surface">
          <Image
            src={slide.src}
            alt={t[slide.titleKey]}
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <span className="bg-bg/90 absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {t[slide.categoryKey]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
          {t[slide.titleKey]}
        </h3>
        <p className="text-muted line-clamp-2 text-sm leading-relaxed">
          {t[slide.excerptKey]}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-1">
          <span className="text-muted inline-flex items-center gap-1.5 text-xs">
            <IconCalendar size={14} aria-hidden="true" />
            {t[slide.dateKey]}
          </span>
          <IconArrowUpRight
            size={16}
            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </a>
  );
}

export function WithCarouselSlides() {
  const t = useMessages("pages").blog;

  return (
    <section className="from-bg to-surface w-full bg-gradient-to-b py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog21Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog21Intro}
          </Typography>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent className="gap-4 md:gap-6">
            {BLOG21_SLIDES.map((slide) => (
              <CarouselItem
                key={slide.src}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <Blog21Card slide={slide} t={t} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <a href={POST_URL}>{t.blog21ViewAllButton}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
