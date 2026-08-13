"use client";

import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const FEATURES = [
  "cta4Feature1",
  "cta4Feature2",
  "cta4Feature3",
  "cta4Feature4",
] as const;

export function MutedFeatureChecklistCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="bg-surface-hover/50 w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="bg-surface grid gap-10 rounded-3xl p-8 shadow-xs md:grid-cols-2 md:p-12">
          <div className="flex flex-col items-start gap-5">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta4Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.cta4Body}
            </Typography>
            <Button
              asChild
              variant="primary"
              rightIcon={<IconArrowRight size={16} />}
            >
              <a href={LINK_URL}>{co.cta4Button}</a>
            </Button>
          </div>
          <ul className="flex flex-col gap-3.5 md:justify-center">
            {FEATURES.map((featureKey) => (
              <li key={featureKey} className="flex items-start gap-2.5">
                <IconCheck size={18} className="text-brand mt-0.5 shrink-0" />
                <Typography variant="bodySmall">{co[featureKey]}</Typography>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
