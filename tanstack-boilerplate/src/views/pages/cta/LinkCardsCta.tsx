"use client";

import {
  IconArrowRight,
  IconBook2,
  IconChevronRight,
  IconRocket,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const LINK_CARDS: { icon: Icon; titleKey: string; bodyKey: string }[] = [
  { icon: IconRocket, titleKey: "cta3Card1Title", bodyKey: "cta3Card1Body" },
  { icon: IconBook2, titleKey: "cta3Card2Title", bodyKey: "cta3Card2Body" },
];

export function LinkCardsCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid gap-12 rounded-3xl border p-8 shadow-xs lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col items-start gap-6">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta3Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta3Body}
            </Typography>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="primary"
                rightIcon={<IconArrowRight size={16} />}
              >
                <a href={LINK_URL}>{co.cta3PrimaryButton}</a>
              </Button>
              <Button asChild variant="outline">
                <a href={LINK_URL}>{co.cta3SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {LINK_CARDS.map((card) => (
              <a
                key={card.titleKey}
                href={LINK_URL}
                className="border-border bg-surface group hover:bg-surface-hover flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-surface-hover border-border flex size-11 shrink-0 items-center justify-center rounded-xl border">
                    <card.icon size={20} className="text-brand" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <Typography variant="h5">{co[card.titleKey]}</Typography>
                    <Typography variant="bodySmall" className="text-muted">
                      {co[card.bodyKey]}
                    </Typography>
                  </div>
                </div>
                <IconChevronRight
                  size={20}
                  className="text-muted shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
