"use client";

import {
  IconArrowRight,
  IconFileText,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const PATTERN_CLASS =
  "bg-[radial-gradient(color-mix(in_srgb,var(--color-fg)_10%,transparent)_1px,transparent_1px)] [background-size:20px_20px]";

const LINK_ROWS: { icon: Icon; titleKey: string; bodyKey: string }[] = [
  {
    icon: IconFileText,
    titleKey: "cta32Link1Title",
    bodyKey: "cta32Link1Body",
  },
  {
    icon: IconLayoutDashboard,
    titleKey: "cta32Link2Title",
    bodyKey: "cta32Link2Body",
  },
];

export function PatternPanelIconCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border grid overflow-hidden rounded-3xl border border-dashed lg:grid-cols-2">
          <div className="bg-surface-hover/50 relative flex items-center justify-center overflow-hidden p-8 lg:p-12">
            <div className={PATTERN_CLASS} aria-hidden="true" />
            <div className="border-border bg-surface/70 relative flex w-full flex-col items-start gap-5 rounded-2xl border p-6 shadow-xs backdrop-blur-sm lg:p-8">
              <Typography
                variant="h2"
                className="text-3xl font-medium tracking-tighter md:text-4xl"
              >
                {co.cta32PanelTitle}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {co.cta32PanelBody}
              </Typography>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button
                  asChild
                  variant="primary"
                  className="w-full !rounded-full sm:w-auto"
                >
                  <a href={LINK_URL}>{co.cta32PanelPrimaryButton}</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full !rounded-full sm:w-auto"
                >
                  <a href={LINK_URL}>{co.cta32PanelSecondaryButton}</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-4 sm:p-5 lg:p-8">
            <div className="divide-border divide-y">
              {LINK_ROWS.map((row) => (
                <a
                  key={row.titleKey}
                  href={LINK_URL}
                  className="group hover:bg-surface-hover -mx-2 flex items-start gap-4 rounded-2xl px-2 py-5 transition-colors"
                >
                  <span className="bg-surface-hover border-border flex size-11 shrink-0 items-center justify-center rounded-xl border">
                    <row.icon
                      size={20}
                      className="text-brand"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-fg text-base font-semibold">
                      {co[row.titleKey]}
                    </span>
                    <span className="text-muted text-sm leading-relaxed">
                      {co[row.bodyKey]}
                    </span>
                  </span>
                  <IconArrowRight
                    size={18}
                    className="text-muted mt-1 ml-auto shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
