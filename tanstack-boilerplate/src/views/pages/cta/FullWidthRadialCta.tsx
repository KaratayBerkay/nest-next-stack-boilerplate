"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-16x9-6.webp" as const;
const IMAGE_SIZES = "100vw" as const;

const VIGNETTE = {
  backgroundImage:
    "radial-gradient(ellipse 65% 70% at center, color-mix(in srgb, var(--color-fg) 62%, transparent) 0%, transparent 74%)",
} as const;

export function FullWidthRadialCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="relative flex min-h-[480px] w-full items-center justify-center overflow-hidden lg:min-h-[640px]">
      <Image
        src={IMAGE_SRC}
        alt={co.cta46ImageAlt}
        fill
        sizes={IMAGE_SIZES}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0" style={VIGNETTE} />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-16 text-center">
        <Typography
          variant="h2"
          className="text-bg max-w-3xl text-4xl font-medium tracking-tighter text-balance md:text-6xl"
        >
          {co.cta46Title}
        </Typography>
        <Typography variant="bodyLarge" className="text-bg/70 max-w-xl">
          {co.cta46Description}
        </Typography>
        <Button
          asChild
          variant="primary"
          size="lg"
          className="mt-2"
          rightIcon={<IconArrowRight size={16} />}
        >
          <a href={LINK_URL}>{co.cta46Button}</a>
        </Button>
      </div>
    </section>
  );
}
