"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function LeftAccentDualCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-brand/10 rounded-3xl px-6 py-14 lg:px-12 lg:py-20">
          <div className="flex max-w-2xl flex-col items-start gap-6">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta13Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta13Body}
            </Typography>
            <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta13PrimaryButton}</a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta13SecondaryButton}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
