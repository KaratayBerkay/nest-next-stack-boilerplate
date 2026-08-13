"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const PANELS = [
  "top-4 -left-2 h-40 w-28 rotate-[-10deg] rounded-2xl border border-border bg-surface-hover shadow-xs lg:h-48 lg:w-40",
  "top-2 left-16 h-44 w-28 rotate-[2deg] rounded-2xl border border-border bg-surface shadow-md lg:h-52 lg:w-40",
  "top-0 left-32 h-48 w-28 rotate-[12deg] rounded-2xl border border-brand/30 bg-brand/10 shadow-lg lg:h-56 lg:w-40",
] as const;

export function StackedPanelsCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="bg-brand/10 w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 lg:px-8">
        <div className="border-border bg-surface grid items-center gap-10 rounded-3xl border p-8 shadow-xs lg:grid-cols-2 lg:p-14">
          <div className="flex flex-col items-start gap-5">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-6xl"
            >
              {co.cta6Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta6Body}
            </Typography>
            <Button asChild variant="primary">
              <a href={LINK_URL}>{co.cta6Button}</a>
            </Button>
          </div>
          <div
            aria-hidden="true"
            className="relative flex h-52 items-end justify-end overflow-hidden lg:h-64"
          >
            {PANELS.map((panelClass) => (
              <div
                key={panelClass}
                className={`absolute right-0 bottom-0 ${panelClass}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
