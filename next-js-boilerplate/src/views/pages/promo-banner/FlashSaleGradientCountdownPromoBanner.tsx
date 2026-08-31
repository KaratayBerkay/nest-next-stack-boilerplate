"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IconBolt, IconX } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

// Demo-only sale end: ~5h45m out from whenever this block mounts. Computed
// inside the effect (client-only) so it never leaks into the initial render
// output — see the useEffect below.
const SALE_OFFSET_SECONDS = 5 * 3600 + 45 * 60;
const SHOP_URL = "https://example.com" as const;

interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
}

const UNITS = [
  { id: "hours", labelKey: "promoBanner5UnitHours" },
  { id: "minutes", labelKey: "promoBanner5UnitMinutes" },
  { id: "seconds", labelKey: "promoBanner5UnitSeconds" },
] as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function FlashSaleGradientCountdownPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const [visible, setVisible] = useState(true);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = Date.now() + SALE_OFFSET_SECONDS * 1000;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
      });
    };
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  if (!visible) return null;

  const valueFor = (unitId: (typeof UNITS)[number]["id"]) =>
    remaining ? String(remaining[unitId]).padStart(2, "0") : "--";

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="from-brand to-info text-brand-fg relative w-full bg-gradient-to-br">
        <IconButton
          icon={<IconX size={16} />}
          label={p.promoBannerCloseAria}
          size="icon-sm"
          className="text-brand-fg hover:bg-brand-fg/10 absolute top-3 right-3"
          onClick={() => dismissBanner(setVisible)}
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-10 text-center lg:py-14">
          <span className="bg-brand-fg/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase">
            <IconBolt size={13} aria-hidden="true" />
            {p.promoBanner5Eyebrow}
          </span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {p.promoBanner5Heading}
          </h2>
          <p className="text-brand-fg/85 max-w-md text-sm">
            {p.promoBanner5Body}
          </p>
          <div
            className="flex items-center gap-2 sm:gap-3"
            suppressHydrationWarning
          >
            {UNITS.map((unit) => (
              <div
                key={unit.id}
                className="bg-brand-fg/15 flex w-14 flex-col items-center gap-0.5 rounded-lg py-2 sm:w-16"
              >
                <span className="text-lg font-bold tabular-nums sm:text-xl">
                  {valueFor(unit.id)}
                </span>
                <span className="text-brand-fg/70 text-[10px] tracking-wide uppercase">
                  {p[unit.labelKey]}
                </span>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-1" asChild>
            <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
              {p.promoBanner5Button}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
