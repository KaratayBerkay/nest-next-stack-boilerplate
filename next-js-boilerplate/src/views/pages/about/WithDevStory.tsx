"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function WithDevStory() {
  const t = useMessages("pages").about;

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a5Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a5Heading}
          </Typography>
        </div>

        <div className="flex flex-col gap-4">
          <AspectRatio
            ratio={21 / 9}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="https://picsum.photos/seed/about5-main/1680/720"
              alt={t.a5MainAlt}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </AspectRatio>
          <Typography variant="caption">{t.a5Caption}</Typography>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a5StoryHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a5StoryBody}
            </Typography>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                { value: t.a5Stat1Value, label: t.a5Stat1Label },
                { value: t.a5Stat2Value, label: t.a5Stat2Label },
              ] as const
            ).map((stat) => (
              <Card key={stat.label} className="flex flex-col gap-2 p-6">
                <Typography
                  variant="h3"
                  className="text-4xl font-medium tracking-tight tabular-nums"
                >
                  {stat.value}
                </Typography>
                <Typography variant="caption">{stat.label}</Typography>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          <Typography
            variant="h3"
            className="text-2xl font-medium tracking-tighter md:text-3xl"
          >
            {t.a5CrewHeading}
          </Typography>
          <Typography variant="body" className="text-muted">
            {t.a5CrewParagraph1}
          </Typography>
          <Typography variant="body" className="text-muted">
            {t.a5CrewParagraph2}
          </Typography>
        </div>

        <AspectRatio ratio={16 / 9} className="bg-surface relative rounded-2xl">
          <Image
            src="https://picsum.photos/seed/about5-2/1600/900"
            alt={t.a5SecondAlt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        </AspectRatio>
      </div>
    </section>
  );
}
