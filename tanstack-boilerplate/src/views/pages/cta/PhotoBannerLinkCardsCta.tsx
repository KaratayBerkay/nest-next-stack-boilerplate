"use client";

import Image from "next/image";
import { IconBook2, IconRocket } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-3x2-0.webp" as const;
const IMAGE_SIZES = "(max-width: 768px) 100vw, 1152px";
const WASH_CLASS =
  "bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-bg)_85%,transparent)_0%,color-mix(in_srgb,var(--color-bg)_45%,transparent)_45%,transparent_78%)]";

const LINK_CARDS: { icon: Icon; titleKey: string; bodyKey: string }[] = [
  { icon: IconBook2, titleKey: "cta26Card1Title", bodyKey: "cta26Card1Body" },
  { icon: IconRocket, titleKey: "cta26Card2Title", bodyKey: "cta26Card2Body" },
];

export function PhotoBannerLinkCardsCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-3xl border shadow-xs">
          <div className="relative flex h-[420px] items-center justify-center sm:h-[480px]">
            <Image
              src={IMAGE_SRC}
              alt={co.cta26ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
            <div className={WASH_CLASS} aria-hidden="true" />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {co.cta26Title}
              </Typography>
              <Typography variant="bodyLarge" className="max-w-xl">
                {co.cta26Body}
              </Typography>
              <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full !rounded-full sm:w-auto"
                  rightIcon={<IconRocket size={16} aria-hidden="true" />}
                >
                  <a href={LINK_URL}>{co.cta26PrimaryButton}</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full !rounded-full sm:w-auto"
                >
                  <a href={LINK_URL}>{co.cta26SecondaryButton}</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            {LINK_CARDS.map((card) => (
              <a
                key={card.titleKey}
                href={LINK_URL}
                className="border-border bg-surface group flex flex-col gap-3 rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="bg-surface-hover border-border flex size-11 items-center justify-center rounded-xl border">
                  <card.icon
                    size={20}
                    className="text-brand"
                    aria-hidden="true"
                  />
                </span>
                <Typography variant="h5">{co[card.titleKey]}</Typography>
                <Typography variant="body" className="text-muted">
                  {co[card.bodyKey]}
                </Typography>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
