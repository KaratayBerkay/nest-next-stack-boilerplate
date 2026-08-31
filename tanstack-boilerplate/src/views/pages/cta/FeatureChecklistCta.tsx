"use client";

import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const FEATURES = [
  "cta7Feature1",
  "cta7Feature2",
  "cta7Feature3",
  "cta7Feature4",
] as const;

export function FeatureChecklistCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="bg-brand/10 w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-3xl border p-8 shadow-xs lg:p-14">
          <div className="grid items-end gap-10 xl:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-6">
              <Typography
                variant="bodySmall"
                className="text-brand text-xs font-semibold tracking-widest uppercase"
              >
                {co.cta7Tagline}
              </Typography>
              <Typography
                variant="h2"
                className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {co.cta7Title}
              </Typography>
              <ul className="grid gap-3.5 sm:grid-cols-2">
                {FEATURES.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-2.5">
                    <IconCheck
                      size={18}
                      className="text-brand mt-0.5 shrink-0"
                    />
                    <Typography variant="bodySmall" className="text-muted">
                      {co[featureKey]}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Button
                asChild
                variant="primary"
                className="w-full sm:w-auto xl:w-full"
              >
                <a href={LINK_URL}>{co.cta7PrimaryButton}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto xl:w-full"
              >
                <a href={LINK_URL}>{co.cta7SecondaryButton}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
