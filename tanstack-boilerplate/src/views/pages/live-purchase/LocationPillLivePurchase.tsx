"use client";

import { useEffect, useState } from "react";
import { IconMapPin } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithLivePurchaseMessages } from "@/types/pages/live-purchase/LivePurchaseMessages-types";

const CYCLE_MS = 3500;

interface PillEvent {
  id: string;
  seed: string;
  initials: string;
  headlineKey: string;
  cityKey: string;
  timeKey: string;
}

const EVENTS: PillEvent[] = [
  {
    id: "location-pill-1",
    seed: "live-purchase-pill-elif",
    initials: "EK",
    headlineKey: "livePurchase2Event1Headline",
    cityKey: "livePurchase2Event1City",
    timeKey: "livePurchase2Event1Time",
  },
  {
    id: "location-pill-2",
    seed: "live-purchase-pill-noah",
    initials: "NR",
    headlineKey: "livePurchase2Event2Headline",
    cityKey: "livePurchase2Event2City",
    timeKey: "livePurchase2Event2Time",
  },
  {
    id: "location-pill-3",
    seed: "live-purchase-pill-hana",
    initials: "HS",
    headlineKey: "livePurchase2Event3Headline",
    cityKey: "livePurchase2Event3City",
    timeKey: "livePurchase2Event3Time",
  },
  {
    id: "location-pill-4",
    seed: "live-purchase-pill-marco",
    initials: "MB",
    headlineKey: "livePurchase2Event4Headline",
    cityKey: "livePurchase2Event4City",
    timeKey: "livePurchase2Event4Time",
  },
];

export function LocationPillLivePurchase() {
  const t = useMessages("pages") as unknown as PagesWithLivePurchaseMessages;
  const lp = t.livePurchase;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % EVENTS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const event = EVENTS[index];

  return (
    <section className="border-border bg-surface relative flex h-[420px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      <div
        key={event.id}
        role="status"
        aria-live="polite"
        className="animate-fade-in-right border-border bg-bg flex max-w-sm items-center gap-3 rounded-full border py-2 pr-5 pl-2 shadow-lg motion-reduce:animate-none"
      >
        <Avatar
          size="sm"
          src={placeholderImage(event.seed, "1x1")}
          alt=""
          fallback={event.initials}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-fg truncate text-sm font-medium">
            {lp[event.headlineKey]}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <IconMapPin size={11} className="text-muted shrink-0" />
            <span className="text-muted text-xs">{lp[event.cityKey]}</span>
            <span className="text-muted text-xs">&middot;</span>
            <span className="text-muted text-xs">{lp[event.timeKey]}</span>
          </div>
        </div>
        <span className="relative ml-1 inline-flex size-2 shrink-0">
          <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
          <span className="bg-success relative inline-flex size-2 rounded-full" />
        </span>
      </div>
    </section>
  );
}
