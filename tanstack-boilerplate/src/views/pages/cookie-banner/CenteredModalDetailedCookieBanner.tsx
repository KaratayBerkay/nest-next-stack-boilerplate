"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CenteredModalDetailedCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  const points = [
    c.cookieBanner18Point1,
    c.cookieBanner18Point2,
    c.cookieBanner18Point3,
  ];

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border p-6">
      <div className="bg-overlay/50 animate-fade-in absolute inset-0 motion-reduce:animate-none" />
      <div className="border-border bg-bg animate-scale-in relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6 shadow-xl motion-reduce:animate-none">
        <div className="flex flex-col gap-1.5">
          <p className="text-fg text-base font-semibold">
            {c.cookieBanner18Heading}
          </p>
          <p className="text-muted text-sm">{c.cookieBanner18Body}</p>
        </div>
        <ul className="flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <IconCheck
                size={16}
                className="text-brand mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span className="text-fg text-sm">{point}</span>
            </li>
          ))}
        </ul>
        <div className="flex w-full items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner18Decline}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner18Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
