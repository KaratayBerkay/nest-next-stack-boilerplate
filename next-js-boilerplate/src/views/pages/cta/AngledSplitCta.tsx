"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "https://picsum.photos/seed/cta18-visual/1000/750" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function AngledSplitCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface-hover/50 grid items-center gap-10 overflow-hidden rounded-3xl border p-8 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col items-start gap-5">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {co.cta18Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-md">
              {co.cta18Body}
            </Typography>
            <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta18PrimaryButton}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto"
                rightIcon={<IconArrowRight size={16} />}
              >
                <a href={LINK_URL}>{co.cta18SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="border-border bg-surface absolute inset-0 -rotate-6 rounded-3xl border"
            />
            <div className="bg-surface border-border relative rotate-2 rounded-3xl border p-3 shadow-xs">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={IMAGE_SRC}
                  alt={co.cta18ImageAlt}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
