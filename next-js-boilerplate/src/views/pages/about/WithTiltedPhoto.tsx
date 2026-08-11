"use client";

import Image from "next/image";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const STATS = [
  { valueKey: "a15Stat1Value", labelKey: "a15Stat1Label" },
  { valueKey: "a15Stat2Value", labelKey: "a15Stat2Label" },
  { valueKey: "a15Stat3Value", labelKey: "a15Stat3Label" },
  { valueKey: "a15Stat4Value", labelKey: "a15Stat4Label" },
] as const;

const CONTACT_ROWS = [
  { icon: IconMail, textKey: "a15ContactEmail" },
  { icon: IconPhone, textKey: "a15ContactPhone" },
  { icon: IconMapPin, textKey: "a15ContactAddress" },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithTiltedPhoto() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 lg:gap-28 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.a15Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.a15Body}
            </Typography>
            <Button variant="primary">{t.a15Button}</Button>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="bg-brand/10 absolute -inset-4 rounded-2xl" />
            <div className="rotate-3">
              <AspectRatio
                ratio={3 / 4}
                className="bg-surface relative rounded-2xl"
              >
                <Image
                  src="https://picsum.photos/seed/about15-main/600/800"
                  alt={t.a15MainImageAlt}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover"
                />
              </AspectRatio>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.labelKey} className="flex flex-col gap-2">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tight tabular-nums"
              >
                {t[stat.valueKey]}
              </Typography>
              <Typography variant="caption">{t[stat.labelKey]}</Typography>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a15HelpHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a15HelpBody}
            </Typography>
          </div>

          <Card className="flex flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-4">
              {CONTACT_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.textKey} className="flex items-center gap-3">
                    <Icon size={20} className="text-muted shrink-0" />
                    <Typography variant="body" className="text-sm">
                      {t[row.textKey]}
                    </Typography>
                  </div>
                );
              })}
            </div>
            <Button asChild variant="outline" className="w-fit">
              <a href={`mailto:${t.a15ContactEmail}`}>{t.a15ContactButton}</a>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
