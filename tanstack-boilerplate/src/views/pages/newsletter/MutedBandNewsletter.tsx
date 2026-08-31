"use client";

import { IconArrowRight, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNewsletterMessages } from "@/types/pages/newsletter/NewsletterMessages-types";

export function MutedBandNewsletter() {
  const t = useMessages("pages") as unknown as PagesWithNewsletterMessages;
  const n = t.newsletter;

  return (
    <section className="bg-surface border-border w-full border-y py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <span className="border-border bg-bg text-muted flex size-10 shrink-0 items-center justify-center rounded-full border">
            <IconMail size={17} aria-hidden="true" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-fg text-sm font-semibold">
              {n.newsletter3Heading}
            </span>
            <span className="text-muted text-sm">{n.newsletter3Body}</span>
          </div>
        </div>
        <form
          className="flex w-full max-w-sm gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            type="email"
            required
            placeholder={n.newsletter3Placeholder}
            aria-label={n.newsletter3Placeholder}
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="shrink-0">
            {n.newsletter3Submit}
            <IconArrowRight size={14} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </section>
  );
}
