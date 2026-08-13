"use client";

import Image from "next/image";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "https://picsum.photos/seed/cta16-hero/1600/900" as const;
const IMAGE_SIZES = "100vw";

export function ContainedFlatCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src={IMAGE_SRC}
              alt={co.cta16ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
          <div aria-hidden="true" className="bg-fg/40 absolute inset-0" />
          <div className="relative flex flex-col items-center gap-5 px-6 py-20 text-center lg:py-28">
            <span className="text-bg text-sm font-semibold tracking-widest uppercase">
              {co.cta16Eyebrow}
            </span>
            <Typography
              variant="h2"
              className="text-bg max-w-3xl text-4xl font-medium tracking-tighter md:text-6xl"
            >
              {co.cta16Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-bg/85 max-w-xl">
              {co.cta16Body}
            </Typography>
            <a
              href={LINK_URL}
              className="text-bg hover:bg-bg/10 border-bg/40 mt-2 inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors"
            >
              {co.cta16Button}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
