"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-1x1-1.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function MaskedSplitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {f.feature38Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature38Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature38Paragraph}</p>
            <a
              href={LINK_URL}
              className="group text-fg inline-flex items-center gap-1.5 text-sm font-medium"
            >
              {f.feature38LearnMore}
              <IconArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div
              aria-hidden="true"
              className="from-brand/20 via-brand/5 absolute inset-0 rotate-6 rounded-[3rem] bg-gradient-to-br to-transparent"
            />
            <Image
              src={IMAGE_SRC}
              alt={f.feature38ImageAlt}
              width={640}
              height={640}
              sizes={IMAGE_SIZES}
              className="relative h-full w-full -rotate-6 rounded-[3rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
