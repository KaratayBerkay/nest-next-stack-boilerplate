"use client";

import Image from "next/image";
import { IconArrowRight, IconBolt } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-3x2-2.webp" as const;
const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function BorderedIconCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border grid overflow-hidden rounded-2xl border md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-full">
            <Image
              src={IMAGE_SRC}
              alt={co.cta11ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start justify-center gap-5 p-8 lg:p-12">
            <div className="flex items-center gap-3">
              <span className="bg-surface-hover border-border flex size-10 items-center justify-center rounded-xl border">
                <IconBolt size={20} className="text-brand" />
              </span>
              <Typography
                variant="h2"
                className="text-3xl font-medium tracking-tight md:text-4xl"
              >
                {co.cta11Title}
              </Typography>
            </div>
            <Typography variant="body" className="text-muted">
              {co.cta11Body}
            </Typography>
            <Button
              asChild
              variant="primary"
              rightIcon={<IconArrowRight size={16} />}
            >
              <a href={LINK_URL}>{co.cta11Button}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
