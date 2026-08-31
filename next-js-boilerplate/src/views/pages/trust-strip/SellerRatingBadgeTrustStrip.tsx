"use client";

import { IconRosetteDiscountCheck, IconStarFilled } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithTrustStripMessages } from "@/types/pages/trust-strip/TrustStripMessages-types";

const STAR_SLOTS = [0, 1, 2, 3, 4] as const;

export function SellerRatingBadgeTrustStrip() {
  const t = useMessages("pages") as unknown as PagesWithTrustStripMessages;
  const ts = t.trustStrip;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-6 rounded-2xl border p-6 sm:flex-row lg:p-8">
        <div className="flex items-center gap-4">
          <Avatar
            size="lg"
            src={placeholderImage("trust-strip-4-seller", "1x1")}
            alt={ts.trustStrip4SellerName}
            fallback={ts.trustStrip4SellerInitials}
          />
          <div className="flex flex-col gap-1">
            <span className="text-fg flex items-center gap-1.5 text-base font-semibold tracking-tight">
              {ts.trustStrip4SellerName}
              <IconRosetteDiscountCheck
                size={17}
                aria-hidden="true"
                className="text-brand"
              />
            </span>
            <span className="text-muted text-sm">
              {ts.trustStrip4SellerRole}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge variant="warning" size="sm" pill className="gap-1">
            <IconStarFilled size={12} aria-hidden="true" />
            {ts.trustStrip4TopRated}
          </Badge>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5">
              {STAR_SLOTS.map((slot) => (
                <IconStarFilled
                  key={slot}
                  size={14}
                  aria-hidden="true"
                  className="text-warning"
                />
              ))}
            </span>
            <span className="text-fg text-sm font-medium">
              {ts.trustStrip4Rating}
            </span>
          </div>
          <span className="text-muted text-xs">
            {ts.trustStrip4ReviewCount}
          </span>
        </div>
      </div>
    </section>
  );
}
