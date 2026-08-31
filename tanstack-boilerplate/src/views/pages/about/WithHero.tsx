"use client";

import Image from "next/image";
import { IconClock, IconUsers, IconWorld } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const GLOBAL_TEAM_BULLETS = [
  { icon: IconWorld, titleKey: "a14Bullet1Title", bodyKey: "a14Bullet1Body" },
  { icon: IconUsers, titleKey: "a14Bullet2Title", bodyKey: "a14Bullet2Body" },
  { icon: IconClock, titleKey: "a14Bullet3Title", bodyKey: "a14Bullet3Body" },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithHero() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 lg:gap-28 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="soft">{t.a14Badge}</Badge>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.a14Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.a14Body}
            </Typography>
            <Button variant="primary">{t.a14Button}</Button>
          </div>

          <div className="relative">
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-4x3-6.webp"
                alt={t.a14MainImageAlt}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
            <div className="bg-surface border-border absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border p-4 shadow-md">
              <Avatar
                src="/img/placeholders/ph-1x1-6.webp"
                alt={t.a14CardAvatarAlt}
                fallback={t.a14CardName.slice(0, 2)}
                size="lg"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t.a14CardName}</span>
                <span className="text-muted text-xs">{t.a14CardJoined}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <AspectRatio
            ratio={16 / 9}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-16x9-4.webp"
              alt={t.a14SecondaryImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </AspectRatio>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {t.a14GlobalHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.a14GlobalBody}
              </Typography>
            </div>
            <ul className="flex flex-col gap-5">
              {GLOBAL_TEAM_BULLETS.map((bullet) => {
                const Icon = bullet.icon;
                return (
                  <li key={bullet.titleKey} className="flex items-start gap-4">
                    <div className="bg-brand/10 flex h-fit w-fit shrink-0 rounded-lg p-2">
                      <Icon size={24} className="text-brand" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Typography
                        variant="h3"
                        className="text-base font-medium tracking-tight"
                      >
                        {t[bullet.titleKey]}
                      </Typography>
                      <Typography variant="body" className="text-muted text-sm">
                        {t[bullet.bodyKey]}
                      </Typography>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
