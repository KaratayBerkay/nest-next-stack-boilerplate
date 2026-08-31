"use client";

import { useState } from "react";
import { IconLock, IconChartBar, IconSpeakerphone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner11AnalyticsLabel",
    descKey: "cookieBanner11AnalyticsDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner11MarketingLabel",
    descKey: "cookieBanner11MarketingDesc",
  },
] as const;

export function CornerCardDialogCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<
    Record<(typeof CATEGORIES)[number]["id"], boolean>
  >({
    analytics: true,
    marketing: true,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-start overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-xs flex-col gap-3 rounded-xl border p-5 shadow-lg motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner11Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner11Body}</p>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger variant="outline" size="sm" className="flex-1">
              {c.cookieBanner11Manage}
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>{c.cookieBanner11DialogTitle}</DialogTitle>
                <DialogDescription>
                  {c.cookieBanner11DialogDescription}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <IconLock
                        size={16}
                        className="text-muted mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-fg text-sm font-medium">
                          {c.cookieBanner11NecessaryLabel}{" "}
                          <span className="text-muted text-xs font-normal">
                            · {c.cookieBanner11AlwaysOn}
                          </span>
                        </span>
                        <span className="text-muted text-xs">
                          {c.cookieBanner11NecessaryDesc}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked
                      disabled
                      onChange={() => {}}
                      aria-label={c.cookieBanner11NecessaryLabel}
                    />
                  </div>
                  {CATEGORIES.map((item, index) => (
                    <div key={item.id}>
                      {index === 0 && <Separator />}
                      <div className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-start gap-2.5">
                          <item.icon
                            size={16}
                            className="text-muted mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-fg text-sm font-medium">
                              {c[item.labelKey]}
                            </span>
                            <span className="text-muted text-xs">
                              {c[item.descKey]}
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={prefs[item.id]}
                          onChange={(e) =>
                            setPrefs((prev) => ({
                              ...prev,
                              [item.id]: e.target.checked,
                            }))
                          }
                          aria-label={c[item.labelKey]}
                        />
                      </div>
                      {index < CATEGORIES.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogClose variant="primary" className="w-full">
                  {c.cookieBanner11Save}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner11Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
