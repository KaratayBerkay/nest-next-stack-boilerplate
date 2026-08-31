"use client";

import Image from "next/image";
import { IconBolt, IconScale } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const FEATURES = [
  { icon: IconBolt, titleKey: "a18Feature1Title", bodyKey: "a18Feature1Body" },
  { icon: IconScale, titleKey: "a18Feature2Title", bodyKey: "a18Feature2Body" },
] as const;

const PRINCIPLES = [
  { titleKey: "a18Principle1Title", bodyKey: "a18Principle1Body" },
  { titleKey: "a18Principle2Title", bodyKey: "a18Principle2Body" },
  { titleKey: "a18Principle3Title", bodyKey: "a18Principle3Body" },
] as const;

export function WithMissionAndDrive() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <AspectRatio
            ratio={4 / 5}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-4x5-3.webp"
              alt={t.a18ImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </AspectRatio>

          <div className="flex flex-col gap-6">
            <Typography variant="overline">{t.a18Label}</Typography>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.a18Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.a18Body}
            </Typography>

            <div className="grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.titleKey} className="flex flex-col gap-3">
                    <div className="bg-brand/10 flex h-fit w-fit rounded-xl p-3">
                      <FeatureIcon size={24} className="text-brand" />
                    </div>
                    <Typography
                      variant="h3"
                      className="text-xl font-medium tracking-tight"
                    >
                      {t[feature.titleKey]}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {t[feature.bodyKey]}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a18MissionLabel}</Typography>
          <Typography
            variant="h3"
            className="max-w-2xl text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {t.a18MissionHeading}
          </Typography>
          <Typography
            variant="bodyLarge"
            className="text-muted mx-auto max-w-3xl"
          >
            {t.a18MissionBody}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <Card key={principle.titleKey} className="flex flex-col gap-4 p-8">
              <span className="text-muted font-mono text-sm tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t[principle.titleKey]}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t[principle.bodyKey]}
              </Typography>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
