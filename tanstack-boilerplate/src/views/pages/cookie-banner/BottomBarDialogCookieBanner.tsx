"use client";

import { useState } from "react";
import { IconChartBar, IconSpeakerphone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
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
    labelKey: "cookieBanner9AnalyticsLabel",
    descKey: "cookieBanner9AnalyticsDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner9MarketingLabel",
    descKey: "cookieBanner9MarketingDesc",
  },
] as const;

export function BottomBarDialogCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<Record<(typeof CATEGORIES)[number]["id"], boolean>>({
    analytics: true,
    marketing: false,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t px-4 py-5 motion-reduce:animate-none sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-0.5">
            <p className="text-fg text-sm font-semibold">
              {c.cookieBanner9Heading}
            </p>
            <p className="text-muted text-sm">{c.cookieBanner9Body}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner9RejectAll}
            </Button>
            <Dialog>
              <DialogTrigger variant="outline" size="sm">
                {c.cookieBanner9Customize}
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>{c.cookieBanner9DialogTitle}</DialogTitle>
                  <DialogDescription>
                    {c.cookieBanner9DialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <div className="flex flex-col gap-3">
                    <div className="bg-surface flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-fg text-sm font-medium">
                          {c.cookieBanner9NecessaryLabel}{" "}
                          <span className="text-muted text-xs font-normal">
                            · {c.cookieBanner9AlwaysOn}
                          </span>
                        </span>
                        <span className="text-muted text-xs">
                          {c.cookieBanner9NecessaryDesc}
                        </span>
                      </div>
                      <Switch
                        checked
                        disabled
                        onChange={() => {}}
                        aria-label={c.cookieBanner9NecessaryLabel}
                      />
                    </div>
                    {CATEGORIES.map((item) => (
                      <div
                        key={item.id}
                        className="bg-surface flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex items-start gap-2">
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
                    ))}
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose variant="ghost">
                    {c.cookieBanner9Cancel}
                  </DialogClose>
                  <DialogClose variant="primary">
                    {c.cookieBanner9Save}
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner9AcceptAll}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
