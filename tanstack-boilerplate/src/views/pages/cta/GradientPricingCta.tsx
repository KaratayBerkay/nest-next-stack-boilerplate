"use client";

import { IconChevronRight, IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const PRICE = "$29" as const;

const CHECKLIST_KEYS = [
  "cta40ChecklistItem1",
  "cta40ChecklistItem2",
  "cta40ChecklistItem3",
] as const;

const PLUS_PATTERN = {
  backgroundImage:
    "linear-gradient(90deg, transparent 10.5px, color-mix(in srgb, var(--color-brand-fg) 55%, transparent) 10.5px 13px, transparent 13px 24px), linear-gradient(0deg, transparent 10.5px, color-mix(in srgb, var(--color-brand-fg) 55%, transparent) 10.5px 13px, transparent 13px 24px)",
  backgroundSize: "24px 24px",
  maskImage: "linear-gradient(to right, black, transparent)",
  WebkitMaskImage: "linear-gradient(to right, black, transparent)",
} as const;

export function GradientPricingCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="from-brand to-brand/70 text-brand-fg relative overflow-hidden rounded-3xl bg-gradient-to-r">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={PLUS_PATTERN}
          />
          <div className="relative z-10 grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-16">
            <div className="flex flex-col items-start gap-5">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {co.cta40Title}
              </Typography>
              <Typography variant="bodyLarge" className="text-brand-fg/75">
                {co.cta40Description}
              </Typography>
              <div className="hidden gap-3 lg:flex">
                <Button
                  asChild
                  size="lg"
                  className="!bg-brand-fg !text-brand hover:!bg-brand-fg/90"
                  rightIcon={<IconChevronRight size={16} />}
                >
                  <a href={LINK_URL}>{co.cta40PrimaryButton}</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="!border-brand-fg/30 !text-brand-fg hover:!bg-brand-fg/10 !bg-transparent"
                  rightIcon={<IconChevronRight size={16} />}
                >
                  <a href={LINK_URL}>{co.cta40SecondaryButton}</a>
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-6xl font-semibold tracking-tighter lg:text-7xl">
                  {PRICE}
                </span>
                <span className="text-brand-fg/75 text-sm">
                  {co.cta40PricePeriod}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5">
                {CHECKLIST_KEYS.map((key) => (
                  <li key={key} className="flex items-center gap-2.5">
                    <IconCircleCheck size={18} aria-hidden="true" />
                    <span className="text-brand-fg/90 text-sm lg:text-base">
                      {co[key]}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex w-full flex-col gap-3 lg:hidden">
                <Button
                  asChild
                  size="lg"
                  className="!bg-brand-fg !text-brand hover:!bg-brand-fg/90 w-full"
                  rightIcon={<IconChevronRight size={16} />}
                >
                  <a href={LINK_URL}>{co.cta40PrimaryButton}</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="!border-brand-fg/30 !text-brand-fg hover:!bg-brand-fg/10 w-full !bg-transparent"
                  rightIcon={<IconChevronRight size={16} />}
                >
                  <a href={LINK_URL}>{co.cta40SecondaryButton}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
