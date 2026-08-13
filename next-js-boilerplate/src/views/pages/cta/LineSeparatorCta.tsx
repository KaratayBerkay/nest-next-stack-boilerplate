"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function LineSeparatorCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <Typography variant="overline" className="text-center">
            {co.cta20Label}
          </Typography>
          <div className="flex w-full items-center gap-4 sm:gap-8">
            <span
              aria-hidden="true"
              className="bg-border h-px min-w-8 flex-1"
            />
            <Button
              asChild
              variant="primary"
              size="lg"
              className="shrink-0 !rounded-full px-8"
            >
              <a href={LINK_URL}>{co.cta20Button}</a>
            </Button>
            <span
              aria-hidden="true"
              className="bg-border h-px min-w-8 flex-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
