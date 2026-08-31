"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

interface ShotTile {
  id: string;
  seed: string;
  aspect: "16x9" | "4x5" | "1x1" | "3x2";
  aspectClass: string;
  spanClass: string;
  titleKey: string;
  bodyKey: string;
  altKey: string;
  badgeKey: string;
}

const SHOTS: ShotTile[] = [
  {
    id: "shot-1",
    seed: "bento-shot-workspace",
    aspect: "16x9",
    aspectClass: "aspect-video",
    spanClass: "sm:col-span-2 lg:col-span-3",
    titleKey: "bento3Shot1Title",
    bodyKey: "bento3Shot1Body",
    altKey: "bento3Shot1Alt",
    badgeKey: "bento3Shot1Badge",
  },
  {
    id: "shot-2",
    seed: "bento-shot-mobile",
    aspect: "4x5",
    aspectClass: "aspect-[4/5]",
    spanClass: "",
    titleKey: "bento3Shot2Title",
    bodyKey: "bento3Shot2Body",
    altKey: "bento3Shot2Alt",
    badgeKey: "bento3Shot2Badge",
  },
  {
    id: "shot-3",
    seed: "bento-shot-analytics",
    aspect: "3x2",
    aspectClass: "aspect-[3/2]",
    spanClass: "",
    titleKey: "bento3Shot3Title",
    bodyKey: "bento3Shot3Body",
    altKey: "bento3Shot3Alt",
    badgeKey: "bento3Shot3Badge",
  },
  {
    id: "shot-4",
    seed: "bento-shot-settings",
    aspect: "1x1",
    aspectClass: "aspect-square",
    spanClass: "",
    titleKey: "bento3Shot4Title",
    bodyKey: "bento3Shot4Body",
    altKey: "bento3Shot4Alt",
    badgeKey: "bento3Shot4Badge",
  },
];

export function ScreenshotShowcaseBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento3Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOTS.map((shot) => (
            <Card key={shot.id} variant="default" className={shot.spanClass}>
              <div className="flex h-full flex-col gap-4 p-4 @sm:p-5">
                <div
                  className={cn(
                    "border-border relative overflow-hidden rounded-lg border",
                    shot.aspectClass,
                  )}
                >
                  <Image
                    src={placeholderImage(shot.seed, shot.aspect)}
                    alt={b[shot.altKey]}
                    fill
                    className="object-cover"
                  />
                  <Badge
                    variant="default"
                    size="sm"
                    className="absolute top-3 left-3"
                  >
                    {b[shot.badgeKey]}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-fg text-sm font-semibold">
                    {b[shot.titleKey]}
                  </h3>
                  <p className="text-muted mt-1 text-sm leading-relaxed">
                    {b[shot.bodyKey]}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
