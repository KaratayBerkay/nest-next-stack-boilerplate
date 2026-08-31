"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithMagicLinkMessages } from "@/types/pages/magic-link/MagicLinkMessages-types";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function InlinePillMagicLink() {
  const t = useMessages("pages") as unknown as PagesWithMagicLinkMessages;
  const ml = t.magicLink;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 text-center">
        <span className="bg-brand/10 text-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <IconSparkles size={13} aria-hidden="true" />
          {ml.magicLink3Eyebrow}
        </span>
        <h2 className="text-fg text-3xl font-semibold tracking-tight">
          {ml.magicLink3Title}
        </h2>
        <p className="text-muted text-sm">{ml.magicLink3Description}</p>

        {submitted ? (
          <div className="border-success/30 bg-success/10 text-success flex h-12 w-full items-center justify-between gap-3 rounded-full pr-1.5 pl-4 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <IconCircleCheck
                size={16}
                className="shrink-0"
                aria-hidden="true"
              />
              <span className="truncate font-medium">{email}</span>
            </span>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="bg-bg text-fg hover:bg-surface-hover shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {ml.magicLink3EditAction}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="border-border bg-surface focus-within:border-brand flex h-12 w-full items-center rounded-full border pr-1.5 pl-4 transition-colors"
          >
            <label htmlFor="ml3-email" className="sr-only">
              {ml.magicLink3EmailLabel}
            </label>
            <input
              id="ml3-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={ml.magicLink3EmailPlaceholder}
              className="text-fg placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              aria-label={ml.magicLink3SubmitAria}
              className="bg-brand text-brand-fg hover:bg-brand/90 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <IconArrowRight size={15} aria-hidden="true" />
            </button>
          </form>
        )}

        <p className="text-muted flex items-center gap-1.5 text-xs">
          <IconClock size={12} aria-hidden="true" />
          {ml.magicLink3ExpiryNote}
        </p>
      </div>
    </section>
  );
}
