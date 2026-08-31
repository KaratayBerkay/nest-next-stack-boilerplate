"use client";

import Image from "next/image";
import { IconPalette } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const HERO_SEED = "service2-brand-hero";

const STATS = [
  {
    id: "brands",
    valueKey: "service2Stat1Value",
    labelKey: "service2Stat1Label",
  },
  {
    id: "sprint",
    valueKey: "service2Stat2Value",
    labelKey: "service2Stat2Label",
  },
  {
    id: "formats",
    valueKey: "service2Stat3Value",
    labelKey: "service2Stat3Label",
  },
  {
    id: "handoff",
    valueKey: "service2Stat4Value",
    labelKey: "service2Stat4Label",
  },
] as const;

export function PhotoHeroStatsService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <AspectRatio ratio={21 / 9} className="bg-surface relative rounded-2xl">
          <Image
            src={placeholderImage(HERO_SEED, "16x9")}
            alt={s.service2HeroImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover"
            priority
          />
          <div className="from-bg/90 via-bg/20 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 lg:p-10">
            <Badge variant="soft" size="sm" className="w-fit">
              <IconPalette size={14} className="mr-1.5" aria-hidden="true" />
              {s.service2Badge}
            </Badge>
            <h1 className="text-fg max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
              {s.service2Heading}
            </h1>
            <p className="text-fg/80 max-w-xl leading-relaxed">
              {s.service2Subheading}
            </p>
          </div>
        </AspectRatio>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="border-border bg-surface flex flex-col items-center gap-1 rounded-lg border p-8 text-center shadow-sm"
            >
              <span className="text-fg text-3xl font-semibold tracking-tight tabular-nums">
                {s[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{s[stat.labelKey]}</span>
            </div>
          ))}
        </div>

        <div className="border-border mt-10 flex flex-col items-center justify-between gap-6 border-t pt-8 text-center lg:flex-row lg:text-left">
          <p className="text-muted max-w-xl leading-relaxed">
            {s.service2ClosingLine}
          </p>
          <Button variant="primary" className="shrink-0">
            {s.service2Cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
