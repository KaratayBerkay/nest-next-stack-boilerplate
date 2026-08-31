"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IconClock, IconX } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

// Demo-only cutoff: ~6h42m out from whenever this block mounts. Computed
// inside the effect (client-only) so it never leaks into the initial render
// output — see the useEffect below.
const CUTOFF_OFFSET_SECONDS = 6 * 3600 + 42 * 60;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

function formatClock(secondsLeft: number | null): string {
  if (secondsLeft === null) return "--:--:--";
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

export function DeliveryCutoffCountdownPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const [visible, setVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.now() + CUTOFF_OFFSET_SECONDS * 1000;
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.round((target - Date.now()) / 1000)));
    };
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="border-border bg-surface flex w-full flex-wrap items-center justify-center gap-2 border-b px-4 py-3 sm:gap-3 sm:px-6">
        <IconClock size={16} className="text-brand hidden shrink-0 sm:block" aria-hidden="true" />
        <p
          className="flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5 text-center text-sm"
          suppressHydrationWarning
        >
          <span className="text-muted">{p.promoBanner3Label}</span>
          <span
            className="text-fg font-mono text-base font-semibold tabular-nums"
            aria-live="polite"
            aria-label={p.promoBanner3TimerAria}
          >
            {formatClock(secondsLeft)}
          </span>
          <span className="text-muted">{p.promoBanner3Suffix}</span>
        </p>
        <Button type="button" variant="primary" size="xs" className="shrink-0">
          {p.promoBanner3Button}
        </Button>
        <IconButton
          icon={<IconX size={16} />}
          label={p.promoBannerCloseAria}
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={() => dismissBanner(setVisible)}
        />
      </div>
    </section>
  );
}
