"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-4x3-7.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";
const PANEL_GRADIENT = {
  backgroundImage:
    "radial-gradient(ellipse 90% 80% at 30% 20%, color-mix(in srgb, var(--brand) 22%, transparent), transparent 75%)",
} as const;

export function GradientPanelPhotoCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            style={PANEL_GRADIENT}
            className="flex flex-col items-start gap-5 rounded-3xl p-8 lg:p-12"
          >
            <span className="text-brand text-sm font-semibold tracking-wider uppercase">
              {co.cta15Byline}
            </span>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta15Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-md">
              {co.cta15Body}
            </Typography>
            <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta15PrimaryButton}</a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta15SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div
              aria-hidden="true"
              className="bg-brand/25 absolute top-8 right-0 size-2/3 rounded-full blur-3xl"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xs">
              <Image
                src={IMAGE_SRC}
                alt={co.cta15ImageAlt}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
