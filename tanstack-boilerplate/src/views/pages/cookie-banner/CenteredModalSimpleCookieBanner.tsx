"use client";

import { useState } from "react";
import { IconShieldCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CenteredModalSimpleCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border p-6">
      <div className="bg-overlay/50 animate-fade-in absolute inset-0 motion-reduce:animate-none" />
      <div className="border-border bg-bg animate-scale-in relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border p-7 text-center shadow-xl motion-reduce:animate-none">
        <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
          <IconShieldCheck size={24} aria-hidden="true" />
        </span>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-fg text-base font-semibold">
            {c.cookieBanner17Heading}
          </p>
          <p className="text-muted text-sm">{c.cookieBanner17Body}</p>
        </div>
        <div className="flex w-full items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner17Reject}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner17Accept}
          </Button>
        </div>
        <Badge variant="outline" size="sm">
          {c.cookieBanner17Badge}
        </Badge>
      </div>
    </section>
  );
}
