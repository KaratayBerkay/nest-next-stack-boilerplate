"use client";

import Image from "next/image";
import { IconCalendar } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
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
  Blog41Slide,
  BlogMessages,
} from "@/types/pages/blog/WithThreeCardCarousel-types";

const BLOG41_SLIDES: Blog41Slide[] = [
  {
    src: "/img/placeholders/ph-3x2-1.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post1Title",
    excerptKey: "blog41Post1Excerpt",
    categoryKey: "blog41Post1Category",
    dateKey: "blog41Post1Date",
    authorKey: "blog41Post1Author",
  },
  {
    src: "/img/placeholders/ph-3x2-5.webp",
    avatarSrc: "/img/placeholders/ph-1x1-2.webp",
    titleKey: "blog41Post2Title",
    excerptKey: "blog41Post2Excerpt",
    categoryKey: "blog41Post2Category",
    dateKey: "blog41Post2Date",
    authorKey: "blog41Post2Author",
  },
  {
    src: "/img/placeholders/ph-3x2-7.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post3Title",
    excerptKey: "blog41Post3Excerpt",
    categoryKey: "blog41Post3Category",
    dateKey: "blog41Post3Date",
    authorKey: "blog41Post3Author",
  },
  {
    src: "/img/placeholders/ph-3x2-6.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post4Title",
    excerptKey: "blog41Post4Excerpt",
    categoryKey: "blog41Post4Category",
    dateKey: "blog41Post4Date",
    authorKey: "blog41Post4Author",
  },
  {
    src: "/img/placeholders/ph-3x2-2.webp",
    avatarSrc: "/img/placeholders/ph-1x1-2.webp",
    titleKey: "blog41Post5Title",
    excerptKey: "blog41Post5Excerpt",
    categoryKey: "blog41Post5Category",
    dateKey: "blog41Post5Date",
    authorKey: "blog41Post5Author",
  },
  {
    src: "/img/placeholders/ph-3x2-0.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post6Title",
    excerptKey: "blog41Post6Excerpt",
    categoryKey: "blog41Post6Category",
    dateKey: "blog41Post6Date",
    authorKey: "blog41Post6Author",
  },
  {
    src: "/img/placeholders/ph-3x2-1.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post7Title",
    excerptKey: "blog41Post7Excerpt",
    categoryKey: "blog41Post7Category",
    dateKey: "blog41Post7Date",
    authorKey: "blog41Post7Author",
  },
  {
    src: "/img/placeholders/ph-3x2-2.webp",
    avatarSrc: "/img/placeholders/ph-1x1-4.webp",
    titleKey: "blog41Post8Title",
    excerptKey: "blog41Post8Excerpt",
    categoryKey: "blog41Post8Category",
    dateKey: "blog41Post8Date",
    authorKey: "blog41Post8Author",
  },
  {
    src: "/img/placeholders/ph-3x2-1.webp",
    avatarSrc: "/img/placeholders/ph-1x1-2.webp",
    titleKey: "blog41Post9Title",
    excerptKey: "blog41Post9Excerpt",
    categoryKey: "blog41Post9Category",
    dateKey: "blog41Post9Date",
    authorKey: "blog41Post9Author",
  },
];

const CAROUSEL_OPTS = { align: "start", loop: true } as const;
const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
const POST_URL = "https://example.com" as const;

function Blog41Card({ slide, t }: { slide: Blog41Slide; t: BlogMessages }) {
  return (
    <a
      href={POST_URL}
      className="border-border bg-bg group flex h-full flex-col overflow-hidden rounded-xl border shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
    >
      <AspectRatio ratio={3 / 2} className="bg-surface relative">
        <Image
          src={slide.src}
          alt={t[slide.titleKey]}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="bg-bg/90 absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {t[slide.categoryKey]}
        </span>
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
          {t[slide.titleKey]}
        </h3>
        <p className="text-muted line-clamp-2 text-sm leading-relaxed">
          {t[slide.excerptKey]}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="border-border text-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
            <IconCalendar size={14} aria-hidden="true" />
            {t[slide.dateKey]}
          </span>
          <span className="flex items-center gap-2">
            <Avatar
              src={slide.avatarSrc}
              alt={t[slide.authorKey]}
              fallback={t[slide.authorKey]}
              size="sm"
            />
            <span className="text-muted text-xs font-medium">
              {t[slide.authorKey]}
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}

export function WithThreeCardCarousel() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog41Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog41Intro}
          </Typography>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent className="gap-4 md:gap-6">
            {BLOG41_SLIDES.map((slide) => (
              <CarouselItem
                key={slide.src}
                className="sm:basis-1/2 lg:basis-1/3"
              >
                <Blog41Card slide={slide} t={t} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
