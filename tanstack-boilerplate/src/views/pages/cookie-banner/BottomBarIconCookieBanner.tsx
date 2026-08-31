"use client";

import { useState } from "react";
import { IconShieldCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function BottomBarIconCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t px-4 py-5 motion-reduce:animate-none sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
              <IconShieldCheck size={20} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-fg text-sm font-semibold">
                {c.cookieBanner3Heading}
              </p>
              <p className="text-muted text-sm">{c.cookieBanner3Body}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner3Decline}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner3Accept}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
