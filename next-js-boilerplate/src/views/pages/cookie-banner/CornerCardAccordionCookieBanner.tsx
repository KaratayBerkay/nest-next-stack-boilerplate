"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconChartBar,
  IconSpeakerphone,
  IconServer2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const CATEGORIES = [
  {
    id: "analytics",
    icon: IconChartBar,
    labelKey: "cookieBanner12AnalyticsLabel",
    descKey: "cookieBanner12AnalyticsDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner12MarketingLabel",
    descKey: "cookieBanner12MarketingDesc",
  },
  {
    id: "functional",
    icon: IconServer2,
    labelKey: "cookieBanner12FunctionalLabel",
    descKey: "cookieBanner12FunctionalDesc",
  },
] as const;

export function CornerCardAccordionCookieBanner() {
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
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-sm flex-col gap-3 rounded-xl border p-5 shadow-xl motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner12Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner12Body}</p>

        <div className="flex items-center justify-between gap-3 rounded-lg py-1.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-fg text-sm font-medium">
              {c.cookieBanner12NecessaryLabel}{" "}
              <span className="text-muted text-xs font-normal">
                · {c.cookieBanner12AlwaysOn}
              </span>
            </span>
            <span className="text-muted text-xs">
              {c.cookieBanner12NecessaryDesc}
            </span>
          </div>
          <Switch
            checked
            disabled
            onChange={() => {}}
            aria-label={c.cookieBanner12NecessaryLabel}
          />
        </div>

        <Accordion type="single" collapsible className="flex flex-col">
          {CATEGORIES.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-transparent"
            >
              <AccordionTrigger className="group px-0 py-2.5">
                <span className="flex items-center gap-2">
                  <item.icon
                    size={16}
                    className="text-muted"
                    aria-hidden="true"
                  />
                  {c[item.labelKey]}
                </span>
                <IconChevronDown
                  size={16}
                  aria-hidden="true"
                  className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="flex items-center justify-between gap-3 pb-1">
                  <span className="text-muted text-xs">{c[item.descKey]}</span>
                  <Switch
                    checked={prefs[item.id]}
                    onChange={(e) =>
                      setPrefs((prev) => ({
                        ...prev,
                        [item.id]: e.target.checked,
                      }))
                    }
                    switchSize="sm"
                    aria-label={c[item.labelKey]}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner12SaveSelected}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner12AcceptAll}
          </Button>
        </div>
      </div>
    </section>
  );
}
