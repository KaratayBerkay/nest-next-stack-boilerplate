"use client";

import { IconStarFilled, IconStarHalfFilled } from "@tabler/icons-react";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTrustStripMessages } from "@/types/pages/trust-strip/TrustStripMessages-types";

const FULL_STARS = [0, 1, 2, 3] as const;

const PRESS_MENTIONS = [
  { id: "outlet-1", nameKey: "trustStrip2Press1" },
  { id: "outlet-2", nameKey: "trustStrip2Press2" },
  { id: "outlet-3", nameKey: "trustStrip2Press3" },
  { id: "outlet-4", nameKey: "trustStrip2Press4" },
] as const;

export function PressRatingStripTrustStrip() {
  const t = useMessages("pages") as unknown as PagesWithTrustStripMessages;
  const ts = t.trustStrip;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface mx-auto flex w-full max-w-5xl flex-col items-center gap-6 rounded-2xl border px-6 py-8 lg:flex-row lg:justify-between lg:px-10">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <div className="flex items-center gap-2">
            <span className="text-fg text-2xl font-semibold tracking-tight">
              {ts.trustStrip2Rating}
            </span>
            <span className="flex items-center gap-0.5">
              {FULL_STARS.map((slot) => (
                <IconStarFilled
                  key={slot}
                  size={16}
                  aria-hidden="true"
                  className="text-warning"
                />
              ))}
              <IconStarHalfFilled
                size={16}
                aria-hidden="true"
                className="text-warning"
              />
            </span>
          </div>
          <span className="text-muted text-sm">{ts.trustStrip2Subtitle}</span>
        </div>
        <Separator className="lg:hidden" />
        <div aria-hidden="true" className="bg-border hidden h-12 w-px lg:block" />
        <div className="flex flex-col items-center gap-3 lg:items-end">
          <span className="text-muted text-xs font-semibold tracking-[0.2em] uppercase">
            {ts.trustStrip2Eyebrow}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-end">
            {PRESS_MENTIONS.map((item) => (
              <span
                key={item.id}
                className="text-muted font-serif text-lg font-semibold tracking-tight"
              >
                {ts[item.nameKey]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
