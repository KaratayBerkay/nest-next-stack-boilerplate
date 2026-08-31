"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function BorderedGridSplitCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border mx-auto grid w-full max-w-5xl items-center gap-8 rounded-3xl border p-8 md:p-12 lg:grid-cols-3 lg:gap-16 lg:p-16">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Typography
              variant="h2"
              className="text-2xl font-medium tracking-tight md:text-4xl"
            >
              {co.cta37Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-xl">
              {co.cta37Description}
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" variant="primary" className="w-full">
              <a href={LINK_URL}>{co.cta37PrimaryButton}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <a href={LINK_URL}>{co.cta37SecondaryButton}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
