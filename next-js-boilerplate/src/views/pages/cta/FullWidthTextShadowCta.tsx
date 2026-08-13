"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "https://picsum.photos/seed/cta45-hero/1600/900" as const;
const IMAGE_SIZES = "100vw" as const;

const TEXT_SHADOW = {
  textShadow: "0 2px 24px color-mix(in srgb, var(--color-fg) 55%, transparent)",
} as const;

export function FullWidthTextShadowCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="relative flex min-h-[480px] w-full items-center justify-center overflow-hidden lg:min-h-[640px]">
      <Image
        src={IMAGE_SRC}
        alt={co.cta45ImageAlt}
        fill
        sizes={IMAGE_SIZES}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-16 text-center">
        <Typography
          variant="h2"
          className="text-bg max-w-4xl text-4xl font-medium tracking-tighter text-balance md:text-7xl"
          style={TEXT_SHADOW}
        >
          {co.cta45Title}
        </Typography>
        <Typography
          variant="bodyLarge"
          className="text-bg/80 max-w-xl"
          style={TEXT_SHADOW}
        >
          {co.cta45Description}
        </Typography>
        <Button asChild variant="primary" size="lg" className="mt-2">
          <a href={LINK_URL}>{co.cta45Button}</a>
        </Button>
      </div>
    </section>
  );
}
