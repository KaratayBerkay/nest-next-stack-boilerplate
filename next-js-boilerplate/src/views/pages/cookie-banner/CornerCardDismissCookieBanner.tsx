"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CornerCardDismissCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-start overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up relative flex w-full max-w-xs flex-col gap-3 rounded-xl border p-5 pr-11 shadow-lg motion-reduce:animate-none">
        <IconButton
          icon={<IconX size={16} />}
          label={c.cookieBanner5CloseAria}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          onClick={() => setVisible(false)}
        />
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner5Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner5Body}</p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setVisible(false)}
        >
          {c.cookieBanner5Accept}
        </Button>
      </div>
    </section>
  );
}
