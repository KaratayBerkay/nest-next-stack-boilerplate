"use client";

import { useState } from "react";
import {
  IconChartBar,
  IconLock,
  IconServer2,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { CheckboxCard } from "@/components/ui/Checkbox";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner15AnalyticsLabel",
    descKey: "cookieBanner15AnalyticsDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner15MarketingLabel",
    descKey: "cookieBanner15MarketingDesc",
  },
  {
    id: "functional",
    icon: IconServer2,
    labelKey: "cookieBanner15FunctionalLabel",
    descKey: "cookieBanner15FunctionalDesc",
  },
] as const;

export function CategoryTilesPanelCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [prefs, setPrefs] = useState<
    Record<(typeof CATEGORIES)[number]["id"], boolean>
  >({
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
              {c.cookieBanner15Heading}
            </p>
            <p className="text-muted text-sm">{c.cookieBanner15Body}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CheckboxCard
              icon={<IconLock size={16} aria-hidden="true" />}
              title={c.cookieBanner15NecessaryLabel}
              description={c.cookieBanner15NecessaryDesc}
              checked
              onChange={() => {}}
              className="flex-col items-start p-3"
            />
            {CATEGORIES.map((item) => (
              <CheckboxCard
                key={item.id}
                icon={<item.icon size={16} aria-hidden="true" />}
                title={c[item.labelKey]}
                description={c[item.descKey]}
                checked={prefs[item.id]}
                onChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, [item.id]: checked }))
                }
                className="flex-col items-start p-3"
              />
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            className="ml-auto"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner15Continue}
          </Button>
        </div>
      </div>
    </section>
  );
}
