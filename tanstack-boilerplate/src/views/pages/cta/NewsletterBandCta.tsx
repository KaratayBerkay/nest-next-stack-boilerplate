"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowRight, IconCheck, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const BENEFIT_KEYS = [
  "cta23Benefit1",
  "cta23Benefit2",
  "cta23Benefit3",
  "cta23Benefit4",
] as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function NewsletterBandCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-surface-hover/50 w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start gap-5 md:items-center md:text-center">
          <span className="border-border bg-surface flex size-11 items-center justify-center rounded-full border shadow-xs">
            <IconMail size={20} className="text-brand" aria-hidden="true" />
          </span>
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.cta23Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-xl">
            {co.cta23Body}
          </Typography>
          {submitted ? (
            <p
              key={co.cta23Success}
              role="status"
              className="bg-brand/10 text-brand rounded-full px-5 py-2.5 text-sm font-medium"
            >
              {co.cta23Success}
            </p>
          ) : (
            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="border-border bg-surface flex w-full max-w-md items-center rounded-full border p-1 shadow-xs"
            >
              <input
                type="email"
                name="email"
                required
                aria-label={co.cta23EmailAria}
                placeholder={co.cta23EmailPlaceholder}
                className="text-fg placeholder:text-muted/70 w-full min-w-0 bg-transparent px-4 py-2 text-sm focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                aria-label={co.cta23SubmitAria}
                className="shrink-0 !rounded-full"
                rightIcon={<IconArrowRight size={16} aria-hidden="true" />}
              />
            </form>
          )}
          <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 md:justify-center">
            {BENEFIT_KEYS.map((key) => (
              <span
                key={key}
                className="text-muted flex items-center gap-1.5 text-sm"
              >
                <IconCheck
                  size={16}
                  className="text-success"
                  aria-hidden="true"
                />
                {co[key]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
