"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Dots } from "@/views/ui/carousel/CarouselHelpers";
import type {
  Blog42Slide,
  BlogMessages,
} from "@/types/pages/blog/WithFullBleedCarousel-types";

const BLOG42_SLIDES: Blog42Slide[] = [
  {
    src: "/img/placeholders/ph-3x2-1.webp",
    titleKey: "blog42Post1Title",
    descriptionKey: "blog42Post1Description",
    categoryKey: "blog42Post1Category",
    dateKey: "blog42Post1Date",
  },
  {
    src: "/img/placeholders/ph-3x2-4.webp",
    titleKey: "blog42Post2Title",
    descriptionKey: "blog42Post2Description",
    categoryKey: "blog42Post2Category",
    dateKey: "blog42Post2Date",
  },
  {
    src: "/img/placeholders/ph-3x2-5.webp",
    titleKey: "blog42Post3Title",
    descriptionKey: "blog42Post3Description",
    categoryKey: "blog42Post3Category",
    dateKey: "blog42Post3Date",
  },
  {
    src: "/img/placeholders/ph-3x2-7.webp",
    titleKey: "blog42Post4Title",
    descriptionKey: "blog42Post4Description",
    categoryKey: "blog42Post4Category",
    dateKey: "blog42Post4Date",
  },
  {
    src: "/img/placeholders/ph-3x2-0.webp",
    titleKey: "blog42Post5Title",
    descriptionKey: "blog42Post5Description",
    categoryKey: "blog42Post5Category",
    dateKey: "blog42Post5Date",
  },
  {
    src: "/img/placeholders/ph-3x2-1.webp",
    titleKey: "blog42Post6Title",
    descriptionKey: "blog42Post6Description",
    categoryKey: "blog42Post6Category",
    dateKey: "blog42Post6Date",
  },
];

const CAROUSEL_OPTS = { align: "start", loop: true } as const;
const IMAGE_SIZES = "(max-width: 640px) 88vw, (max-width: 1024px) 60vw, 45vw";
const POST_URL = "https://example.com" as const;

function Blog42Card({ slide, t }: { slide: Blog42Slide; t: BlogMessages }) {
  return (
    <a
      href={POST_URL}
      className="border-border bg-bg group flex h-full flex-col overflow-hidden rounded-2xl border shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
    >
      <AspectRatio ratio={16 / 10} className="bg-surface relative">
        <Image
          src={slide.src}
          alt={t[slide.titleKey]}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </AspectRatio>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="border-border text-muted w-fit rounded-full border px-3 py-1 text-xs font-medium">
          {t[slide.categoryKey]}
        </span>
        <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight">
          {t[slide.titleKey]}
        </h3>
        <p className="text-muted line-clamp-2 text-sm leading-relaxed">
          {t[slide.descriptionKey]}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
          <span className="text-muted text-xs">{t[slide.dateKey]}</span>
          <IconArrowUpRight
            size={18}
            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </a>
  );
}

export function WithFullBleedCarousel() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 lg:px-8">
        <Typography
          variant="h2"
          className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
        >
          {t.blog42Heading}
        </Typography>
        <Typography variant="bodyLarge" className="text-muted max-w-2xl">
          {t.blog42Intro}
        </Typography>
      </div>

      <Carousel opts={CAROUSEL_OPTS} className="mt-10">
        <CarouselContent className="gap-5 md:gap-6">
          {BLOG42_SLIDES.map((slide) => (
            <CarouselItem
              key={slide.src}
              className="sm:basis-[88%] md:basis-[60%] lg:basis-[45%]"
            >
              <Blog42Card slide={slide} t={t} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <Dots total={BLOG42_SLIDES.length} className="mt-8" />
      </Carousel>
    </section>
  );
}
