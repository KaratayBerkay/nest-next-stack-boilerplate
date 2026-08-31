"use client";

import { useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CornerCardBottomRightCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-sm flex-col gap-3 rounded-xl border p-5 shadow-xl motion-reduce:animate-none">
        <Badge variant="soft" size="sm" className="w-fit">
          {c.cookieBanner6Badge}
        </Badge>
        <div className="flex items-center gap-2">
          <IconLock size={16} className="text-muted" aria-hidden="true" />
          <p className="text-fg text-sm font-semibold">
            {c.cookieBanner6Heading}
          </p>
        </div>
        <p className="text-muted text-sm">{c.cookieBanner6Body}</p>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner6Decline}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner6Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
