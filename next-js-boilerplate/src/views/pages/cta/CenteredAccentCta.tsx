"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function CenteredAccentCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-brand/10 flex flex-col items-center gap-6 rounded-3xl px-6 py-16 text-center lg:py-24">
          <Typography
            variant="h2"
            className="max-w-3xl text-4xl font-medium tracking-tighter md:text-6xl"
          >
            {co.cta12Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {co.cta12Body}
          </Typography>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta12PrimaryButton}</a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta12SecondaryButton}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
