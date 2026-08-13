"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function DottedPanelCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border relative overflow-hidden rounded-3xl border px-6 py-16 lg:py-24">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(var(--color-fg)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"
          />
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <Typography
              variant="h2"
              className="max-w-3xl text-4xl font-medium tracking-tighter md:text-6xl"
            >
              {co.cta41Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-2xl">
              {co.cta41Description}
            </Typography>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="primary"
                className="w-full sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta41PrimaryButton}</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta41SecondaryButton}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
