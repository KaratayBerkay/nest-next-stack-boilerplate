"use client";

import Image from "next/image";
import {
  IconHeart,
  IconRocket,
  IconShield,
  IconTarget,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const VALUE_ROWS = [
  { icon: IconHeart, titleKey: "a1Value1Title", bodyKey: "a1Value1Body" },
  { icon: IconRocket, titleKey: "a1Value2Title", bodyKey: "a1Value2Body" },
  { icon: IconShield, titleKey: "a1Value3Title", bodyKey: "a1Value3Body" },
] as const;

export function WithMission() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a1Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.a1Subtext}
          </Typography>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <div className="bg-brand/10 flex h-fit w-fit rounded-xl p-3">
              <IconTarget size={24} className="text-brand" />
            </div>
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a1MissionTitle}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a1MissionBody}
            </Typography>
            <AspectRatio
              ratio={16 / 9}
              className="bg-surface relative mt-2 rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-16x9-7.webp"
                alt={t.a1CardAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
          </div>

          <div className="flex flex-col gap-8 md:mt-2">
            {VALUE_ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.titleKey} className="flex flex-col gap-3">
                  <div className="bg-brand/10 flex h-fit w-fit rounded-xl p-3">
                    <Icon size={24} className="text-brand" />
                  </div>
                  <Typography
                    variant="h3"
                    className="text-xl font-medium tracking-tight"
                  >
                    {t[row.titleKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[row.bodyKey]}
                  </Typography>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 p-10 text-center md:p-14">
          <Typography variant="bodyLarge" className="max-w-2xl font-medium">
            {t.a1Quote}
          </Typography>
          <Typography variant="caption">{t.a1QuoteAuthor}</Typography>
        </Card>
      </div>
    </section>
  );
}
