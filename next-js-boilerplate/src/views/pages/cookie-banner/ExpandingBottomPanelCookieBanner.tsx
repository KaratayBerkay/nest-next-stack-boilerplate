"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconChartBar,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const TOGGLES = [
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner8AnalyticsLabel",
    descKey: "cookieBanner8AnalyticsDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner8MarketingLabel",
    descKey: "cookieBanner8MarketingDesc",
  },
] as const;

export function ExpandingBottomPanelCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<
    Record<(typeof TOGGLES)[number]["id"], boolean>
  >({
    analytics: true,
    marketing: false,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t motion-reduce:animate-none">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-0.5">
              <p className="text-fg text-sm font-semibold">
                {c.cookieBanner8Heading}
              </p>
              <p className="text-muted text-sm">{c.cookieBanner8Body}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="text-fg hover:bg-surface-hover focus-visible:ring-brand inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {c.cookieBanner8Customize}
                <IconChevronDown
                  size={16}
                  aria-hidden="true"
                  className={cn(
                    "transition-transform duration-200",
                    expanded && "rotate-180",
                  )}
                />
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisible(false)}
              >
                {c.cookieBanner8RejectAll}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setVisible(false)}
              >
                {c.cookieBanner8AcceptAll}
              </Button>
            </div>
          </div>

          {expanded && (
            <div className="border-border animate-fade-in-down flex flex-col gap-3 border-t pt-4 motion-reduce:animate-none">
              <div className="bg-surface flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-sm font-medium">
                    {c.cookieBanner8NecessaryLabel}{" "}
                    <span className="text-muted text-xs font-normal">
                      · {c.cookieBanner8AlwaysOn}
                    </span>
                  </span>
                  <span className="text-muted text-xs">
                    {c.cookieBanner8NecessaryDesc}
                  </span>
                </div>
                <Switch
                  checked
                  disabled
                  onChange={() => {}}
                  aria-label={c.cookieBanner8NecessaryLabel}
                />
              </div>
              {TOGGLES.map((item) => (
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setExpanded(false)}
              >
                {c.cookieBanner8Save}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
