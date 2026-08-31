"use client";

import Image from "next/image";
import { IconBuilding, IconGlobe, IconUsers } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const ACHIEVEMENTS = [
  {
    icon: IconBuilding,
    titleKey: "a3Achievement1Title",
    bodyKey: "a3Achievement1Body",
  },
  {
    icon: IconUsers,
    titleKey: "a3Achievement2Title",
    bodyKey: "a3Achievement2Body",
  },
  {
    icon: IconGlobe,
    titleKey: "a3Achievement3Title",
    bodyKey: "a3Achievement3Body",
  },
] as const;

export function WithProfile() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h2"
              className="max-w-xl text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.a3Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.a3Body}
            </Typography>
          </div>
          <Typography variant="body" className="text-muted md:pt-2">
            {t.a3Aside}
          </Typography>
        </div>

        <div className="relative">
          <AspectRatio
            ratio={16 / 9}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-16x9-0.webp"
              alt={t.a3MainAlt}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </AspectRatio>

          <Card className="bg-surface -mt-16 ml-8 max-w-md p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <AspectRatio
                ratio={4 / 3}
                className="bg-surface relative rounded-xl"
              >
                <Image
                  src="/img/placeholders/ph-4x3-2.webp"
                  alt={t.a3CardAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </AspectRatio>
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.a3CardHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.a3CardBody}
              </Typography>
            </div>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
          <Typography
            variant="h3"
            className="text-2xl font-medium tracking-tighter md:text-3xl"
          >
            {t.a3SectionHeading}
          </Typography>
          <Typography variant="body" className="text-muted">
            {t.a3SectionText}
          </Typography>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div key={achievement.titleKey} className="flex flex-col gap-3">
                <div className="bg-brand/10 flex h-fit w-fit rounded-xl p-3">
                  <Icon size={24} className="text-brand" />
                </div>
                <Typography
                  variant="h3"
                  className="text-xl font-medium tracking-tight"
                >
                  {t[achievement.titleKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t[achievement.bodyKey]}
                </Typography>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
