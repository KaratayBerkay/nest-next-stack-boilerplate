"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-16x9-7.webp" as const;
const IMAGE_SIZES = "100vw";

export function TextShadowImageCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src={IMAGE_SRC}
              alt={co.cta21ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
          <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center lg:py-28">
            <Typography
              variant="h2"
              className="text-bg max-w-3xl text-4xl font-medium tracking-tighter drop-shadow-lg md:text-6xl"
            >
              {co.cta21Title}
            </Typography>
            <Typography
              variant="bodyLarge"
              className="text-bg/85 max-w-xl drop-shadow-lg"
            >
              {co.cta21Body}
            </Typography>
            <Button
              asChild
              variant="primary"
              size="lg"
              className="mt-2 shadow-lg"
            >
              <a href={LINK_URL}>{co.cta21Button}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
