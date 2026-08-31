"use client";

import Image from "next/image";
import { IconMapPin } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const SKILLS = [
  "a9Skill1",
  "a9Skill2",
  "a9Skill3",
  "a9Skill4",
  "a9Skill5",
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithDevProfile() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a9Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a9Heading}
          </Typography>
        </div>

        <AspectRatio ratio={21 / 9} className="bg-surface relative rounded-2xl">
          <Image
            src="/img/placeholders/ph-2x1-6.webp"
            alt={t.a9PhotoAlt}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
          />
        </AspectRatio>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a9Name}
            </Typography>
            <Typography variant="bodyLarge">{t.a9Role}</Typography>
            <div className="flex items-center gap-2">
              <IconMapPin size={16} className="text-brand" />
              <Typography variant="caption" className="text-fg">
                {t.a9Location}
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Typography variant="body" className="text-muted">
              {t.a9Bio1}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a9Bio2}
            </Typography>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col gap-4 p-8 md:col-span-2">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter"
            >
              {t.a9WorkHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a9WorkBody}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <Badge key={skill} variant="secondary" size="sm">
                  {t[skill]}
                </Badge>
              ))}
            </div>
          </Card>
          <AspectRatio
            ratio={4 / 3}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-4x3-0.webp"
              alt={t.a9ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
