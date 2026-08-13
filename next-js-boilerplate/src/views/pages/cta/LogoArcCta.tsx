"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

interface LogoChip {
  letter: string;
  className: string;
}

const LEFT_ARC: LogoChip[] = [
  { letter: "N", className: "left-[3%] top-[10%] size-14" },
  { letter: "X", className: "left-[11%] top-[26%] size-10" },
  { letter: "V", className: "left-[19%] top-[42%] size-12" },
  { letter: "O", className: "left-[6%] top-[52%] size-10" },
  { letter: "L", className: "left-[14%] top-[66%] size-11" },
];

const RIGHT_ARC: LogoChip[] = [
  { letter: "M", className: "right-[3%] top-[10%] size-14" },
  { letter: "P", className: "right-[11%] top-[26%] size-10" },
  { letter: "T", className: "right-[19%] top-[42%] size-12" },
  { letter: "R", className: "right-[6%] top-[52%] size-10" },
  { letter: "S", className: "right-[14%] top-[66%] size-11" },
];

function renderArc(chips: LogoChip[]) {
  return chips.map((chip) => (
    <span
      key={chip.letter}
      className={cn(
        "border-border bg-surface text-muted absolute flex items-center justify-center rounded-full border text-sm font-semibold",
        chip.className,
      )}
    >
      {chip.letter}
    </span>
  ));
}

export function LogoArcCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
          >
            {renderArc(LEFT_ARC)}
            {renderArc(RIGHT_ARC)}
            <div className="from-bg absolute inset-y-0 left-0 w-20 bg-gradient-to-r to-transparent md:w-32" />
            <div className="from-bg absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent md:w-32" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <Typography
              variant="h2"
              className="from-brand to-brand/50 bg-gradient-to-r bg-clip-text text-4xl font-medium tracking-tighter text-transparent md:text-5xl lg:text-6xl"
            >
              {co.cta31Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-xl">
              {co.cta31Body}
            </Typography>
            <Button
              asChild
              variant="primary"
              size="lg"
              className="!rounded-full"
              rightIcon={<IconArrowRight size={16} aria-hidden="true" />}
            >
              <a href={LINK_URL}>{co.cta31Button}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
