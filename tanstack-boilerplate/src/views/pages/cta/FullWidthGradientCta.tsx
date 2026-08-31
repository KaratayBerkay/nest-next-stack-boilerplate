"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-16x9-5.webp" as const;
const IMAGE_SIZES = "100vw" as const;

export function FullWidthGradientCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="relative flex min-h-[480px] w-full items-center justify-center overflow-hidden lg:min-h-[640px]">
      <Image
        src={IMAGE_SRC}
        alt={co.cta43ImageAlt}
        fill
        sizes={IMAGE_SIZES}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="from-fg/70 via-fg/35 absolute inset-0 bg-gradient-to-b to-transparent"
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-16 text-center">
        <Typography
          variant="h2"
          className="text-bg max-w-3xl text-4xl font-medium tracking-tighter text-balance md:text-6xl"
        >
          {co.cta43Title}
        </Typography>
        <Typography variant="bodyLarge" className="text-bg/70 max-w-xl">
          {co.cta43Description}
        </Typography>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="!bg-bg !text-fg hover:!bg-bg/90 mt-2"
        >
          <a href={LINK_URL}>{co.cta43Button}</a>
        </Button>
      </div>
    </section>
  );
}
