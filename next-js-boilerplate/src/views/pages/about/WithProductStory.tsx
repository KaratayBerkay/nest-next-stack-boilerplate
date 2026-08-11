"use client";

import Image from "next/image";
import { IconChartLine, IconSparkles, IconTool } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const STORY_IMAGES = [
  {
    src: "https://picsum.photos/seed/about7-1/800/1067",
    altKey: "a7Image1Alt",
    ratio: 3 / 4,
  },
  {
    src: "https://picsum.photos/seed/about7-2/800/600",
    altKey: "a7Image2Alt",
    ratio: 4 / 3,
  },
] as const;

const BULLET_ROWS = [
  {
    icon: IconSparkles,
    titleKey: "a7Point1Title",
    bodyKey: "a7Point1Body",
  },
  { icon: IconTool, titleKey: "a7Point2Title", bodyKey: "a7Point2Body" },
  { icon: IconChartLine, titleKey: "a7Point3Title", bodyKey: "a7Point3Body" },
] as const;

const TEAM_MEMBERS = [
  { name: "Anna Smith", roleKey: "a7Member1Role", seed: "about7-member-1" },
  { name: "David Kim", roleKey: "a7Member2Role", seed: "about7-member-2" },
  { name: "Elena Rossi", roleKey: "a7Member3Role", seed: "about7-member-3" },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithProductStory() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4">
            <AspectRatio
              ratio={STORY_IMAGES[0].ratio}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={STORY_IMAGES[0].src}
                alt={t[STORY_IMAGES[0].altKey]}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
            <AspectRatio
              ratio={STORY_IMAGES[1].ratio}
              className="bg-surface relative -mt-16 rounded-2xl md:-mt-24"
            >
              <Image
                src={STORY_IMAGES[1].src}
                alt={t[STORY_IMAGES[1].altKey]}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Typography variant="overline">{t.a7Label}</Typography>
              <Typography
                variant="h2"
                className="max-w-xl text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {t.a7Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted max-w-md">
                {t.a7Paragraph}
              </Typography>
            </div>

            <div className="flex flex-col gap-6">
              {BULLET_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.titleKey} className="flex gap-4">
                    <div className="bg-muted flex h-fit w-fit shrink-0 rounded-lg p-2">
                      <Icon size={16} className="text-brand" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        variant="h3"
                        className="text-base font-medium tracking-tight"
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
        </div>

        <div className="flex flex-col gap-8">
          <Typography
            variant="h3"
            className="text-2xl font-medium tracking-tighter md:text-3xl"
          >
            {t.a7TeamHeading}
          </Typography>
          <div className="grid gap-10 sm:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-3 text-center"
              >
                <Avatar
                  src={`https://picsum.photos/seed/${member.seed}/128/128`}
                  alt={member.name}
                  fallback={member.name}
                  size="lg"
                />
                <div className="flex flex-col gap-1">
                  <Typography
                    variant="h3"
                    className="text-lg font-medium tracking-tight"
                  >
                    {member.name}
                  </Typography>
                  <Typography variant="caption">{t[member.roleKey]}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand/10 flex w-full flex-col items-center gap-6 rounded-2xl px-6 py-12 text-center md:px-12 lg:py-16">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a7CtaHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a7CtaBody}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary">{t.a7CtaButton1}</Button>
            <Button variant="outline">{t.a7CtaButton2}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
