"use client";

import Image from "next/image";
import { IconArrowRight, IconBolt } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-3x2-6.webp" as const;
const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function CardIconCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid overflow-hidden rounded-3xl border shadow-xs md:grid-cols-2">
          <div className="flex flex-col items-start gap-6 p-8 lg:p-12">
            <div className="flex items-center gap-4">
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
                <IconBolt size={22} aria-hidden="true" />
              </span>
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {co.cta1Title}
              </Typography>
            </div>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta1Body}
            </Typography>
            <Button
              asChild
              variant="primary"
              rightIcon={<IconArrowRight size={16} />}
            >
              <a href={LINK_URL}>{co.cta1Button}</a>
            </Button>
          </div>
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-full">
            <Image
              src={IMAGE_SRC}
              alt={co.cta1ImageAlt}
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
