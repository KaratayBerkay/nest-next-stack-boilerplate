"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CornerCardBottomLeftCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-start overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-xs flex-col gap-3 rounded-xl border p-5 shadow-lg motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner4Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner4Body}</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner4Decline}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner4Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
