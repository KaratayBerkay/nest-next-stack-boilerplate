"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AboutImage } from "@/types/pages/about/AboutBlock-types";

const LEFT_IMAGES: AboutImage[] = [
  {
    src: "/img/placeholders/ph-4x3-7.webp",
    ratio: 4 / 3,
  },
  {
    src: "/img/placeholders/ph-4x3-3.webp",
    ratio: 4 / 3,
  },
];

const RIGHT_IMAGE: AboutImage = {
  src: "/img/placeholders/ph-3x4-5.webp",
  ratio: 3 / 4,
};

const IMAGE_SIZES = "(max-width: 768px) 50vw, 25vw";

const LOGOS = ["a2Logo1", "a2Logo2", "a2Logo3", "a2Logo4", "a2Logo5"] as const;

export function WithStats() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a2Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.a2Body}
          </Typography>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="grid gap-4 md:gap-6">
            {LEFT_IMAGES.map((image) => (
              <AspectRatio
                key={image.src}
                ratio={image.ratio}
                className="bg-surface relative rounded-2xl"
              >
                <Image
                  src={image.src}
                  alt={t.a2PhotoAlt}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover"
                />
              </AspectRatio>
            ))}
          </div>
          <AspectRatio
            ratio={RIGHT_IMAGE.ratio}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src={RIGHT_IMAGE.src}
              alt={t.a2PhotoAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <Card className="grid grid-cols-2 gap-8 p-8 md:grid-cols-4 md:p-10">
          {(
            [
              {
                value: t.a2Stat1Value,
                suffix: t.a2Stat1Suffix,
                label: t.a2Stat1Label,
              },
              {
                value: t.a2Stat2Value,
                suffix: t.a2Stat2Suffix,
                label: t.a2Stat2Label,
              },
              {
                value: t.a2Stat3Value,
                suffix: t.a2Stat3Suffix,
                label: t.a2Stat3Label,
              },
              {
                value: t.a2Stat4Value,
                suffix: t.a2Stat4Suffix,
                label: t.a2Stat4Label,
              },
            ] as const
          ).map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Typography
                variant="h3"
                className="text-4xl font-medium tracking-tight tabular-nums md:text-5xl"
              >
                {stat.value}
                {stat.suffix}
              </Typography>
              <Typography variant="caption">{stat.label}</Typography>
            </div>
          ))}
        </Card>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGOS.map((logo) => (
            <Typography
              key={logo}
              variant="bodyLarge"
              className="text-muted font-semibold tracking-tight"
            >
              {t[logo]}
            </Typography>
          ))}
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a2DoHeading}
            </Typography>
            <ul className="flex flex-col gap-4">
              {(
                [
                  t.a2DoBullet1,
                  t.a2DoBullet2,
                  t.a2DoBullet3,
                  t.a2DoBullet4,
                ] as const
              ).map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <IconCheck size={20} className="text-brand mt-0.5 shrink-0" />
                  <Typography variant="body" className="text-muted">
                    {bullet}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a2WhyHeading}
            </Typography>
            <ul className="flex flex-col gap-4">
              {([t.a2Why1, t.a2Why2, t.a2Why3] as const).map(
                (reason, index) => (
                  <li key={reason} className="flex items-start gap-4">
                    <span className="text-muted mt-1 font-mono text-sm tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Typography variant="body" className="text-muted">
                      {reason}
                    </Typography>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
