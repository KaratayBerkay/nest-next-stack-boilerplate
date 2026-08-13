"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function BandedDualButtonsCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-surface-hover/50 flex flex-col items-center gap-6 rounded-3xl px-6 py-14 text-center lg:py-20">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.cta10Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-xl">
            {co.cta10Body}
          </Typography>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta10PrimaryButton}</a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta10SecondaryButton}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
