"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconShieldCheck, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithLivePurchaseMessages } from "@/types/pages/live-purchase/LivePurchaseMessages-types";

const CYCLE_MS = 4200;

interface ToastEvent {
  id: string;
  seed: string;
  headlineKey: string;
  timeKey: string;
}

const EVENTS: ToastEvent[] = [
  {
    id: "corner-toast-1",
    seed: "live-purchase-corner-lamp",
    headlineKey: "livePurchase1Event1Headline",
    timeKey: "livePurchase1Event1Time",
  },
  {
    id: "corner-toast-2",
    seed: "live-purchase-corner-headphones",
    headlineKey: "livePurchase1Event2Headline",
    timeKey: "livePurchase1Event2Time",
  },
  {
    id: "corner-toast-3",
    seed: "live-purchase-corner-backpack",
    headlineKey: "livePurchase1Event3Headline",
    timeKey: "livePurchase1Event3Time",
  },
  {
    id: "corner-toast-4",
    seed: "live-purchase-corner-mug",
    headlineKey: "livePurchase1Event4Headline",
    timeKey: "livePurchase1Event4Time",
  },
];

export function CornerToastLivePurchase() {
  const t = useMessages("pages") as unknown as PagesWithLivePurchaseMessages;
  const lp = t.livePurchase;
  const [index, setIndex] = useState(0);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % EVENTS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const event = EVENTS[index];
  const showToast = event.id !== dismissedId;

  return (
    <section className="border-border bg-surface relative flex h-[420px] w-full items-end overflow-hidden rounded-2xl border p-6">
      {showToast && (
        <div
          key={event.id}
          role="status"
          aria-live="polite"
          className="animate-fade-in-up border-border bg-bg relative flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg motion-reduce:animate-none"
        >
          <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={placeholderImage(event.seed, "1x1")}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="relative inline-flex size-1.5">
                <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
                <span className="bg-success relative inline-flex size-1.5 rounded-full" />
              </span>
              <span className="text-success text-[11px] font-semibold tracking-wide uppercase">
                {lp.livePurchase1LiveLabel}
              </span>
            </div>
            <p className="text-fg text-sm leading-snug font-medium">
              {lp[event.headlineKey]}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <IconShieldCheck size={12} className="text-muted shrink-0" />
              <span className="text-muted text-xs">
                {lp.livePurchase1VerifiedLabel}
              </span>
              <span className="text-muted text-xs">&middot;</span>
              <span className="text-muted text-xs">{lp[event.timeKey]}</span>
            </div>
          </div>
          <IconButton
            icon={<IconX size={14} />}
            label={lp.livePurchase1DismissAria}
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => setDismissedId(event.id)}
          />
        </div>
      )}
    </section>
  );
}
