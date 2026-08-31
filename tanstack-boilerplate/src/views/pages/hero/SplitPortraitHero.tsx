"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

const PORTRAIT_SEED = "hero2-portrait";

export function SplitPortraitHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="w-fit">
            {h.hero2Eyebrow}
          </Badge>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {h.hero2Heading}
          </h1>
          <p className="text-muted max-w-md text-lg">{h.hero2Subheading}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              {h.hero2PrimaryCta}
            </Button>
            <Button variant="ghost" size="lg">
              {h.hero2SecondaryCta}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="border-border relative aspect-[4/5] overflow-hidden rounded-3xl border shadow-lg">
            <Image
              src={placeholderImage(PORTRAIT_SEED, "4x5")}
              alt={h.hero2ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="border-border bg-bg absolute -bottom-6 -left-4 flex items-center gap-5 rounded-2xl border p-5 shadow-xl sm:-left-8">
            <div className="flex flex-col">
              <span className="text-fg text-2xl font-semibold tracking-tight">
                {h.hero2StatValue}
              </span>
              <span className="text-muted text-xs">{h.hero2StatLabel}</span>
            </div>
            <span aria-hidden="true" className="bg-border h-8 w-px" />
            <div className="flex flex-col">
              <span className="text-fg text-2xl font-semibold tracking-tight">
                {h.hero2Stat2Value}
              </span>
              <span className="text-muted text-xs">{h.hero2Stat2Label}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
