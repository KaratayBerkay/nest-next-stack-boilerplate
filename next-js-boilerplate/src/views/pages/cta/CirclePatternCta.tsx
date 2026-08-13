"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const RING_PATTERN = {
  backgroundImage:
    "radial-gradient(circle, color-mix(in srgb, var(--fg) 16%, transparent) 1px, transparent 2px, transparent 12px, color-mix(in srgb, var(--fg) 16%, transparent) 13.5px, transparent 15px, transparent 26px, color-mix(in srgb, var(--fg) 16%, transparent) 27.5px, transparent 29px)",
  backgroundSize: "128px 128px",
} as const;

export function CirclePatternCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border relative overflow-hidden rounded-3xl border">
          <div
            aria-hidden="true"
            style={RING_PATTERN}
            className="absolute inset-0"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center lg:py-24">
            <Typography
              variant="h2"
              className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta17Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-xl">
              {co.cta17Body}
            </Typography>
            <div className="mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta17PrimaryButton}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta17SecondaryButton}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
