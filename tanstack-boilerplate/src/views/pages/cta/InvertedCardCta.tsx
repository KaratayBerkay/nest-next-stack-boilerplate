"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function InvertedCardCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="bg-brand text-brand-fg mx-auto max-w-5xl rounded-3xl p-8 md:p-12 lg:p-16">
          <div className="flex flex-col items-center gap-4 text-center lg:gap-6">
            <Typography
              variant="h2"
              className="text-2xl font-medium tracking-tight md:text-4xl"
            >
              {co.cta38Title}
            </Typography>
            <Typography
              variant="bodyLarge"
              className="text-brand-fg/70 max-w-2xl"
            >
              {co.cta38Description}
            </Typography>
            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="!bg-brand-fg !text-brand hover:!bg-brand-fg/90 w-full sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta38PrimaryButton}</a>
              </Button>
              <Button
                asChild
                size="lg"
                className="!border-brand-fg/30 !text-brand-fg hover:!bg-brand-fg/10 w-full !bg-transparent sm:w-auto"
              >
                <a href={LINK_URL}>{co.cta38SecondaryButton}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
