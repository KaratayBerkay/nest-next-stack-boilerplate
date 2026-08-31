"use client";

import { useEffect, useState } from "react";
import { IconBell, IconCircleCheck, IconHourglass } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithWaitlistMessages } from "@/types/pages/waitlist/WaitlistMessages-types";

// Demo-only launch target: 9 days and 4 hours out from whenever this block
// mounts. Computed inside the effect (client-only) so it never leaks into
// the initial render output — see the useEffect below.
const LAUNCH_OFFSET_MS = 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000;

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const UNITS = [
  { id: "days", labelKey: "waitlist2UnitDays" },
  { id: "hours", labelKey: "waitlist2UnitHours" },
  { id: "minutes", labelKey: "waitlist2UnitMinutes" },
  { id: "seconds", labelKey: "waitlist2UnitSeconds" },
] as const;

export function LaunchCountdownWaitlist() {
  const t = useMessages("pages") as unknown as PagesWithWaitlistMessages;
  const w = t.waitlist;
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = Date.now() + LAUNCH_OFFSET_MS;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
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

  const valueFor = (unitId: (typeof UNITS)[number]["id"]) =>
    remaining ? String(remaining[unitId]).padStart(2, "0") : "--";

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface mx-auto flex max-w-3xl flex-col items-center gap-7 rounded-3xl border px-6 py-12 text-center sm:px-12">
        <Badge variant="soft" size="sm" pill className="gap-1.5">
          <IconHourglass size={13} aria-hidden="true" />
          {w.waitlist2Eyebrow}
        </Badge>
        <div className="flex flex-col gap-3">
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {w.waitlist2Heading}
          </h2>
          <p className="text-muted text-base">{w.waitlist2Body}</p>
        </div>

        <div
          className="flex items-center gap-3 sm:gap-4"
          suppressHydrationWarning
        >
          {UNITS.map((unit) => (
            <div
              key={unit.id}
              className="border-border bg-bg flex w-16 flex-col items-center gap-1 rounded-xl border py-3 sm:w-20 sm:py-4"
            >
              <span className="text-fg text-2xl font-bold tabular-nums sm:text-3xl">
                {valueFor(unit.id)}
              </span>
              <span className="text-muted text-[10px] tracking-wide uppercase sm:text-xs">
                {w[unit.labelKey]}
              </span>
            </div>
          ))}
        </div>

        {notified ? (
          <div className="border-success/30 bg-success/10 text-success flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium">
            <IconCircleCheck size={18} aria-hidden="true" />
            {w.waitlist2SuccessMessage}
          </div>
        ) : (
          <form
            className="flex w-full max-w-sm gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setNotified(true);
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={w.waitlist2Placeholder}
              aria-label={w.waitlist2Placeholder}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {w.waitlist2Submit}
              <IconBell size={14} aria-hidden="true" />
            </Button>
          </form>
        )}

        {!notified && (
          <span className="text-muted text-xs">{w.waitlist2FinePrint}</span>
        )}
      </div>
    </section>
  );
}
