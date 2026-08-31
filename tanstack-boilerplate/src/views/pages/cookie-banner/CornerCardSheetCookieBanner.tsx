"use client";

import { useState } from "react";
import { IconChartBar, IconLock, IconSpeakerphone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "necessary",
    icon: IconLock,
    labelKey: "cookieBanner13NecessaryLabel",
    descKey: "cookieBanner13NecessaryDesc",
    locked: true,
  },
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner13AnalyticsLabel",
    descKey: "cookieBanner13AnalyticsDesc",
    locked: false,
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner13MarketingLabel",
    descKey: "cookieBanner13MarketingDesc",
    locked: false,
  },
] as const;

export function CornerCardSheetCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-sm flex-col gap-3 rounded-xl border p-5 shadow-lg motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner13Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner13Body}</p>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="flex-1">
                {c.cookieBanner13Details}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{c.cookieBanner13SheetTitle}</SheetTitle>
                <SheetDescription>
                  {c.cookieBanner13SheetDescription}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col divide-y divide-border">
                {CATEGORIES.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <item.icon
                        size={16}
                        className="text-muted mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-fg text-sm font-medium">
                          {c[item.labelKey]}
                          {item.locked && (
                            <span className="text-muted text-xs font-normal">
                              {" "}
                              · {c.cookieBanner13AlwaysOn}
                            </span>
                          )}
                        </span>
                        <span className="text-muted text-xs">
                          {c[item.descKey]}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={prefs[item.id]}
                      disabled={item.locked}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          [item.id]: e.target.checked,
                        }))
                      }
                      aria-label={c[item.labelKey]}
                    />
                  </div>
                ))}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="primary">
                    {c.cookieBanner13Save}
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner13Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
