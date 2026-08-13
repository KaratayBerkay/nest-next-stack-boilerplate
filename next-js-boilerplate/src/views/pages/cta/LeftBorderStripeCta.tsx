"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

export function LeftBorderStripeCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-brand flex flex-col items-start gap-5 border-l-4 pl-6 lg:pl-8">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.cta35Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-xl">
            {co.cta35Body}
          </Typography>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta35PrimaryButton}</a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href={LINK_URL}>{co.cta35SecondaryButton}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
