"use client";

import { useState } from "react";
import {
  IconCheck,
  IconChartBar,
  IconLock,
  IconServer2,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "necessary",
    icon: IconLock,
    labelKey: "cookieBanner19NecessaryLabel",
    descKey: "cookieBanner19NecessaryDesc",
    locked: true,
  },
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner19AnalyticsLabel",
    descKey: "cookieBanner19AnalyticsDesc",
    locked: false,
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner19MarketingLabel",
    descKey: "cookieBanner19MarketingDesc",
    locked: false,
  },
  {
    id: "functional",
    icon: IconServer2,
    labelKey: "cookieBanner19FunctionalLabel",
    descKey: "cookieBanner19FunctionalDesc",
    locked: false,
  },
] as const;

export function CenteredModalTabsCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true,
  });

  const overviewPoints = [
    c.cookieBanner19OverviewPoint1,
    c.cookieBanner19OverviewPoint2,
    c.cookieBanner19OverviewPoint3,
  ];

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border p-6">
      <div className="bg-overlay/50 animate-fade-in absolute inset-0 motion-reduce:animate-none" />
      <div className="border-border bg-bg animate-scale-in relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-xl motion-reduce:animate-none">
        <div className="flex flex-col gap-1.5 px-6 pt-6 pb-1">
          <p className="text-fg text-base font-semibold">
            {c.cookieBanner19Heading}
          </p>
          <p className="text-muted text-sm">{c.cookieBanner19Body}</p>
        </div>

        <Tabs defaultValue="overview" className="px-6">
          <TabsList className="mt-2">
            <TabsTrigger value="overview">
              {c.cookieBanner19TabOverview}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              {c.cookieBanner19TabPreferences}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-3 py-4">
            <p className="text-muted text-sm">{c.cookieBanner19OverviewBody}</p>
            <ul className="flex flex-col gap-2">
              {overviewPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <IconCheck
                    size={16}
                    className="text-brand mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-fg text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="preferences" className="flex flex-col gap-2.5 py-4">
            {CATEGORIES.map((item) => (
              <div
                key={item.id}
                className="bg-surface flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
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
                          · {c.cookieBanner19AlwaysOn}
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
          </TabsContent>
        </Tabs>

        <div className="border-border mt-2 flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner19Reject}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner19Save}
          </Button>
        </div>
      </div>
    </section>
  );
}
