"use client";

import Image from "next/image";
import { IconCheck, IconPlus } from "@tabler/icons-react";
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

const PLUS_ICONS = Array.from({ length: 8 }, (_, index) => index);

const STATS = [
  { value: "45", suffix: "%", labelKey: "a8Stat1Label" },
  { value: "90", suffix: "", labelKey: "a8Stat2Label" },
  { value: "1", suffix: "B", labelKey: "a8Stat3Label" },
  { value: "99", suffix: "M", labelKey: "a8Stat4Label" },
] as const;

const CAROUSEL_SLIDES = [
  {
    src: "https://picsum.photos/seed/about8-1/1600/900",
    altKey: "a8Slide1Alt",
  },
  {
    src: "https://picsum.photos/seed/about8-2/1600/900",
    altKey: "a8Slide2Alt",
  },
  {
    src: "https://picsum.photos/seed/about8-3/1600/900",
    altKey: "a8Slide3Alt",
  },
] as const;

const API_BULLETS = ["a8ApiBullet1", "a8ApiBullet2", "a8ApiBullet3"] as const;

const FOUNDERS = [
  { name: "Leo Marchetti", roleKey: "a8Founder1Role" },
  { name: "Sofia Lindqvist", roleKey: "a8Founder2Role" },
  { name: "Omar Haddad", roleKey: "a8Founder3Role" },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithFintech() {
  const t = useMessages("pages").about;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            aria-hidden="true"
            className="text-muted/30 grid w-full max-w-md grid-cols-4 gap-6"
          >
            {PLUS_ICONS.map((icon) => (
              <IconPlus key={icon} size={20} className="mx-auto" />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <Typography variant="overline">{t.a8Label}</Typography>
            <Typography
              variant="h2"
              className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.a8Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-2xl">
              {t.a8Subtext}
            </Typography>
          </div>
        </div>

        <div className="border-border divide-border grid grid-cols-2 gap-y-8 divide-x rounded-2xl border py-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="flex flex-col items-center gap-1 px-4 text-center"
            >
              <Typography
                variant="h2"
                className="text-4xl font-bold tracking-tighter tabular-nums"
              >
                {stat.value}
                {stat.suffix}
              </Typography>
              <Typography variant="caption">{t[stat.labelKey]}</Typography>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a8MissionHeading}
            </Typography>
          </div>
          <div className="flex flex-col gap-4">
            <Typography variant="body" className="text-muted">
              {t.a8MissionBody}
            </Typography>
          </div>
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {CAROUSEL_SLIDES.map((slide) => (
              <CarouselItem key={slide.src}>
                <AspectRatio
                  ratio={16 / 9}
                  className="bg-surface relative rounded-2xl"
                >
                  <Image
                    src={slide.src}
                    alt={t[slide.altKey]}
                    fill
                    sizes={IMAGE_SIZES}
                    className="object-cover"
                  />
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {t.a8ApiHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.a8ApiBody}
              </Typography>
            </div>
            <ul className="flex flex-col gap-3">
              {API_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <IconCheck size={16} className="text-brand shrink-0" />
                  <Typography variant="body" className="text-fg">
                    {t[bullet]}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
          <AspectRatio
            ratio={4 / 3}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="https://picsum.photos/seed/about8-4/800/600"
              alt={t.a8ApiImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a8FoundersHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a8FoundersBody}
            </Typography>
          </div>
          <div className="flex flex-col gap-6">
            {FOUNDERS.map((founder, index) => (
              <div
                key={founder.name}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted font-mono text-sm tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium">{founder.name}</span>
                </div>
                <span className="text-muted text-sm">{t[founder.roleKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
