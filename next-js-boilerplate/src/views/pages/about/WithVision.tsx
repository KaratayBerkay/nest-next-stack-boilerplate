"use client";

import Image from "next/image";
import {
  IconArrowUpRight,
  IconBulb,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AboutImage } from "@/types/pages/about/AboutBlock-types";

const PHOTOS: AboutImage[] = [
  { src: "https://picsum.photos/seed/about4-1/800/1000", ratio: 4 / 5 },
  { src: "https://picsum.photos/seed/about4-2/800/1000", ratio: 4 / 5 },
  { src: "https://picsum.photos/seed/about4-3/800/1000", ratio: 4 / 5 },
  { src: "https://picsum.photos/seed/about4-4/800/1000", ratio: 4 / 5 },
  { src: "https://picsum.photos/seed/about4-5/800/1000", ratio: 4 / 5 },
  { src: "https://picsum.photos/seed/about4-6/800/1000", ratio: 4 / 5 },
];

const IMAGE_SIZES = "(max-width: 768px) 50vw, 25vw";

const WHO_ROWS = [
  { icon: IconUsers, titleKey: "a4Who1Title", bodyKey: "a4Who1Body" },
  { icon: IconSparkles, titleKey: "a4Who2Title", bodyKey: "a4Who2Body" },
  { icon: IconBulb, titleKey: "a4Who3Title", bodyKey: "a4Who3Body" },
] as const;

export function WithVision() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.a4Body}
          </Typography>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {PHOTOS.map((photo) => (
            <AspectRatio
              key={photo.src}
              ratio={photo.ratio}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={photo.src}
                alt={t.a4PhotoAlt}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
          ))}
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a4WhoHeading}
            </Typography>
            <div className="flex flex-col gap-6">
              {WHO_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.titleKey} className="flex items-start gap-4">
                    <div className="bg-muted flex h-fit w-fit shrink-0 rounded-xl p-3">
                      <Icon size={24} className="text-brand" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        variant="h3"
                        className="text-lg font-medium tracking-tight"
                      >
                        {t[row.titleKey]}
                      </Typography>
                      <Typography variant="body" className="text-muted">
                        {t[row.bodyKey]}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-muted flex flex-col justify-center gap-5 rounded-2xl p-8">
            <Typography variant="overline">{t.a4CtaLabel}</Typography>
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter"
            >
              {t.a4CtaHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a4CtaBody}
            </Typography>
            <Button
              rightIcon={<IconArrowUpRight size={16} />}
              className="mt-2 w-fit"
            >
              {t.a4CtaButton}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
