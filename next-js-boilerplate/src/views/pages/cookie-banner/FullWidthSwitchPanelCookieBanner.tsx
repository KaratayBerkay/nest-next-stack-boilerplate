"use client";

import { useState } from "react";
import {
  IconChartBar,
  IconLock,
  IconServer2,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "necessary",
    icon: IconLock,
    labelKey: "cookieBanner14NecessaryLabel",
    descKey: "cookieBanner14NecessaryDesc",
    locked: true,
  },
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner14AnalyticsLabel",
    descKey: "cookieBanner14AnalyticsDesc",
    locked: false,
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner14MarketingLabel",
    descKey: "cookieBanner14MarketingDesc",
    locked: false,
  },
  {
    id: "functional",
    icon: IconServer2,
    labelKey: "cookieBanner14FunctionalLabel",
    descKey: "cookieBanner14FunctionalDesc",
    locked: false,
  },
] as const;

export function FullWidthSwitchPanelCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t motion-reduce:animate-none">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <p className="text-fg text-sm font-semibold">
              {c.cookieBanner14Heading}
            </p>
            <p className="text-muted text-sm">{c.cookieBanner14Body}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CATEGORIES.map((item) => (
              <div
                key={item.id}
                className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
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
                          · {c.cookieBanner14AlwaysOn}
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

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner14SaveSelected}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner14AcceptAll}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
