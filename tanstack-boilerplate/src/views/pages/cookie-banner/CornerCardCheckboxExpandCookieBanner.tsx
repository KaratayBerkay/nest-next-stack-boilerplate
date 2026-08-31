"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconLock,
  IconServer2,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { CheckboxCard } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const OPTIONS = [
  {
    id: "functional",
    icon: IconServer2,
    labelKey: "cookieBanner10FunctionalLabel",
    descKey: "cookieBanner10FunctionalDesc",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "cookieBanner10MarketingLabel",
    descKey: "cookieBanner10MarketingDesc",
  },
] as const;

export function CornerCardCheckboxExpandCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<Record<(typeof OPTIONS)[number]["id"], boolean>>({
    functional: true,
    marketing: false,
  });

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-start overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-sm flex-col gap-3 rounded-xl border p-5 shadow-lg motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner10Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner10Body}</p>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={c.cookieBanner10ExpandAria}
          className="text-fg hover:bg-surface-hover focus-visible:ring-brand -mx-1 inline-flex items-center gap-1 self-start rounded-md px-1 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {c.cookieBanner10Manage}
          <IconChevronDown
            size={14}
            aria-hidden="true"
            className={cn(
              "transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>

        {expanded && (
          <div className="animate-fade-in-down flex flex-col gap-2 motion-reduce:animate-none">
            <CheckboxCard
              icon={<IconLock size={16} aria-hidden="true" />}
              title={c.cookieBanner10NecessaryLabel}
              description={c.cookieBanner10NecessaryDesc}
              checked
              onChange={() => {}}
              className="p-3"
            />
            {OPTIONS.map((item) => (
              <CheckboxCard
                key={item.id}
                icon={<item.icon size={16} aria-hidden="true" />}
                title={c[item.labelKey]}
                description={c[item.descKey]}
                checked={prefs[item.id]}
                onChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, [item.id]: checked }))
                }
                className="p-3"
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner10Accept}
          </Button>
          {expanded && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner10Confirm}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
