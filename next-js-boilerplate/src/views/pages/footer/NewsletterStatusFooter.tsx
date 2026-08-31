"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

export function NewsletterStatusFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <span
            className="bg-success size-1.5 rounded-full"
            aria-hidden="true"
          />
          {f.footer28StatusLabel}
        </span>
        <h3 className="text-fg text-2xl font-semibold tracking-tight">
          {f.footer28Heading}
        </h3>
        <form className="flex w-full max-w-sm gap-2">
          <Input
            type="email"
            placeholder={f.footer28Placeholder}
            className="flex-1"
          />
          <Button type="submit" variant="primary" className="shrink-0">
            {f.footer28Submit}
            <IconArrowRight size={14} aria-hidden="true" />
          </Button>
        </form>
        <span className="text-muted text-xs">{f.footer28Copyright}</span>
      </div>
    </footer>
  );
}
