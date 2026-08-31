"use client";

import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

const SCREENSHOT_SEED = "hero1-screenshot";

export function CenteredScreenshotHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <Badge variant="soft">
          <IconSparkles size={13} className="mr-1.5" aria-hidden="true" />
          {h.hero1Eyebrow}
        </Badge>
        <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
          {h.hero1Heading}
        </h1>
        <p className="text-muted max-w-2xl text-lg">{h.hero1Subheading}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg">
            {h.hero1PrimaryCta}
          </Button>
          <Button variant="outline" size="lg">
            {h.hero1SecondaryCta}
          </Button>
        </div>
        <span className="text-muted text-xs">{h.hero1Disclaimer}</span>
      </div>

      <div className="mx-auto mt-12 max-w-5xl px-6 lg:px-8">
        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-2xl">
          <div className="border-border bg-bg flex items-center gap-2 border-b px-4 py-3">
            <span aria-hidden="true" className="flex items-center gap-1.5">
              <span className="bg-error/70 size-2.5 rounded-full" />
              <span className="bg-warning/70 size-2.5 rounded-full" />
              <span className="bg-success/70 size-2.5 rounded-full" />
            </span>
            <span className="bg-surface text-muted mx-auto flex max-w-xs flex-1 items-center justify-center truncate rounded-md px-3 py-1 text-xs">
              {h.hero1BrowserUrl}
            </span>
          </div>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={placeholderImage(SCREENSHOT_SEED, "16x9")}
              alt={h.hero1ScreenshotAlt}
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
