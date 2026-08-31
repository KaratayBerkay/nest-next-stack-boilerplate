"use client";

import { useEffect, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LiveClockFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  return (
    <footer className="w-full py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="text-fg text-5xl font-semibold tracking-tight lg:text-7xl">
          {f.footer10Brand}
        </span>
        <span className="text-muted font-mono text-sm tabular-nums" suppressHydrationWarning>
          {time ?? "--:--:--"} · {f.footer10Timezone}
        </span>
        <span className="text-muted text-xs">{f.footer10Copyright}</span>
      </div>
    </footer>
  );
}
