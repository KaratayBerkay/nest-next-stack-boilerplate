"use client";

import Image from "next/image";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-16x9-7.webp" as const;
const IMAGE_SIZES = "100vw";

export function ContainedGradientCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src={IMAGE_SRC}
              alt={co.cta14ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="from-fg/80 via-fg/45 to-fg/5 absolute inset-0 bg-gradient-to-b"
          />
          <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center lg:py-28">
            <Typography
              variant="h2"
              className="text-bg max-w-3xl text-4xl font-medium tracking-tighter md:text-6xl"
            >
              {co.cta14Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-bg/85 max-w-xl">
              {co.cta14Body}
            </Typography>
            <a
              href={LINK_URL}
              className="text-bg hover:bg-bg/10 border-bg/40 mt-2 inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors"
            >
              {co.cta14Button}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
