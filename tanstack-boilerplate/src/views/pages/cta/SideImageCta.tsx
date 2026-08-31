"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-3x2-5.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function SideImageCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-surface-hover/50 grid overflow-hidden rounded-3xl lg:grid-cols-2">
          <div className="flex flex-col items-start justify-center gap-5 p-8 lg:p-12">
            <Typography
              variant="h3"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta5Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta5Body}
            </Typography>
            <Button asChild variant="primary">
              <a href={LINK_URL}>{co.cta5Button}</a>
            </Button>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-full">
            <Image
              src={IMAGE_SRC}
              alt={co.cta5ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
