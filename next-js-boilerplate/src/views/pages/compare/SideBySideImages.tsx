"use client";

import { IconArrowRight, IconPhoto, IconSparkles } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

export function SideBySideImages() {
  const t = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = t.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center lg:mb-14">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compare5Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compare5Intro}
          </Typography>
        </div>
        <div className="relative grid gap-8 md:grid-cols-2 lg:gap-10">
          <article className="border-border relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-3xl border lg:min-h-[28rem]">
            <div
              aria-hidden="true"
              className="bg-surface-hover absolute inset-0 flex items-center justify-center"
            >
              <div className="border-border bg-surface ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                <IconPhoto size={44} className="text-muted" stroke={1.5} />
              </div>
            </div>
            <div
              aria-hidden="true"
              className="from-fg/90 via-fg/60 absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t to-transparent backdrop-blur-[2px]"
            />
            <div className="relative z-10 flex flex-col items-start gap-4 p-6 lg:p-8">
              <Typography
                variant="h3"
                className="text-bg text-2xl font-medium tracking-tight"
              >
                {co.compare5OldTitle}
              </Typography>
              <Typography variant="bodySmall" className="text-bg/80">
                {co.compare5OldBody}
              </Typography>
              <button
                type="button"
                className="text-bg hover:bg-bg/10 border-bg/40 inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors"
              >
                {co.compare5OldCta}
                <IconArrowRight size={16} />
              </button>
            </div>
          </article>
          <article className="border-brand/30 relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-3xl border lg:min-h-[28rem]">
            <div
              aria-hidden="true"
              className="bg-surface-hover absolute inset-0 flex items-center justify-center"
            >
              <div className="border-border bg-brand/10 ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                <IconSparkles size={44} className="text-brand" stroke={1.5} />
              </div>
            </div>
            <div
              aria-hidden="true"
              className="from-fg/90 via-fg/60 absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t to-transparent backdrop-blur-[2px]"
            />
            <div className="relative z-10 flex flex-col items-start gap-4 p-6 lg:p-8">
              <Typography
                variant="h3"
                className="text-bg text-2xl font-medium tracking-tight"
              >
                {co.compare5NewTitle}
              </Typography>
              <Typography variant="bodySmall" className="text-bg/80">
                {co.compare5NewBody}
              </Typography>
              <button
                type="button"
                className="text-bg hover:bg-bg/10 border-bg/40 inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors"
              >
                {co.compare5NewCta}
                <IconArrowRight size={16} />
              </button>
            </div>
          </article>
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="border-border bg-surface flex size-14 items-center justify-center rounded-full border text-sm font-semibold tracking-wide shadow-md">
              {co.compare5OrLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
