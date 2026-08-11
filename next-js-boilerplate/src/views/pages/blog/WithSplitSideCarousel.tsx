"use client";

import Image from "next/image";
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
  Blog43Slide,
  BlogMessages,
} from "@/types/pages/blog/WithSplitSideCarousel-types";

const BLOG43_SLIDES: Blog43Slide[] = [
  {
    src: "https://picsum.photos/seed/blog43-1/800/600",
    titleKey: "blog43Post1Title",
    excerptKey: "blog43Post1Excerpt",
    categoryKey: "blog43Post1Category",
    dateKey: "blog43Post1Date",
  },
  {
    src: "https://picsum.photos/seed/blog43-2/800/600",
    titleKey: "blog43Post2Title",
    excerptKey: "blog43Post2Excerpt",
    categoryKey: "blog43Post2Category",
    dateKey: "blog43Post2Date",
  },
  {
    src: "https://picsum.photos/seed/blog43-3/800/600",
    titleKey: "blog43Post3Title",
    excerptKey: "blog43Post3Excerpt",
    categoryKey: "blog43Post3Category",
    dateKey: "blog43Post3Date",
  },
  {
    src: "https://picsum.photos/seed/blog43-4/800/600",
    titleKey: "blog43Post4Title",
    excerptKey: "blog43Post4Excerpt",
    categoryKey: "blog43Post4Category",
    dateKey: "blog43Post4Date",
  },
  {
    src: "https://picsum.photos/seed/blog43-5/800/600",
    titleKey: "blog43Post5Title",
    excerptKey: "blog43Post5Excerpt",
    categoryKey: "blog43Post5Category",
    dateKey: "blog43Post5Date",
  },
  {
    src: "https://picsum.photos/seed/blog43-6/800/600",
    titleKey: "blog43Post6Title",
    excerptKey: "blog43Post6Excerpt",
    categoryKey: "blog43Post6Category",
    dateKey: "blog43Post6Date",
  },
];

const CAROUSEL_OPTS = { align: "start" } as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";
const POST_URL = "https://example.com" as const;

function Blog43Card({ slide, t }: { slide: Blog43Slide; t: BlogMessages }) {
  return (
    <a
      href={POST_URL}
      className="border-border bg-bg group flex h-full flex-col overflow-hidden rounded-2xl border shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
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
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="text-muted text-xs">{t[slide.dateKey]}</span>
        <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight">
          {t[slide.titleKey]}
        </h3>
        <p className="text-muted line-clamp-3 text-sm leading-relaxed">
          {t[slide.excerptKey]}
        </p>
      </div>
    </a>
  );
}

export function WithSplitSideCarousel() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-6 lg:sticky lg:top-24 lg:self-start">
          <span className="border-border text-muted rounded-full border px-3 py-1 text-xs font-medium tracking-wider uppercase">
            {t.blog43Tagline}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog43Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog43Intro}
          </Typography>
          <Button asChild>
            <a href={POST_URL}>{t.blog43CtaButton}</a>
          </Button>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent className="gap-5 md:gap-6">
            {BLOG43_SLIDES.map((slide) => (
              <CarouselItem key={slide.src}>
                <Blog43Card slide={slide} t={t} />
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
