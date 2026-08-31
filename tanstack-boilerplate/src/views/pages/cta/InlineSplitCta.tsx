"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function InlineSplitCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border flex flex-col gap-8 border-b pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-col items-start gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {co.cta36Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta36Body}
            </Typography>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta36PrimaryButton}</a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta36SecondaryButton}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
