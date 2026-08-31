"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function BottomBarMinimalCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t px-4 py-4 motion-reduce:animate-none sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-fg text-sm">{c.cookieBanner1Message}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner1Decline}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner1Accept}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
