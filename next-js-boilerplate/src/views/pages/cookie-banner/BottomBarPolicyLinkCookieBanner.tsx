"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function BottomBarPolicyLinkCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t px-4 py-5 shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.25)] motion-reduce:animate-none sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <p className="text-fg text-sm font-semibold">
              {c.cookieBanner2Heading}
            </p>
            <p className="text-muted text-sm">
              {c.cookieBanner2Body}{" "}
              <Link
                href="#"
                className="text-brand underline underline-offset-4 hover:no-underline"
              >
                {c.cookieBanner2PolicyLink}
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner2RejectAll}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner2AcceptAll}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
