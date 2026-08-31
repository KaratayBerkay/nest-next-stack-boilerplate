"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

export function ImpactTypographyHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-20 lg:py-32">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <h1 className="text-fg flex flex-col text-6xl leading-[0.95] font-semibold tracking-tighter lg:text-8xl">
          <span>{h.hero8HeadingLine1}</span>
          <span className="text-muted italic">{h.hero8HeadingEmphasis}</span>
          <span>{h.hero8HeadingLine2}</span>
        </h1>
        <p className="text-muted max-w-md text-xl">{h.hero8Subheading}</p>
        <div>
          <Button
            variant="link"
            size="lg"
            className="!px-0"
            rightIcon={<IconArrowRight size={18} aria-hidden="true" />}
          >
            {h.hero8CtaLabel}
          </Button>
        </div>
        <span className="text-muted mt-8 text-xs">{h.hero8Caption}</span>
      </div>
    </section>
  );
}
