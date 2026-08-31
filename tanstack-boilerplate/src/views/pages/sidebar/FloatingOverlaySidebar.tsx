"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconChartBar,
  IconClock,
  IconFilePlus,
  IconLayoutGrid,
  IconSearch,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface ShortcutItem {
  id: string;
  icon: typeof IconSearch;
  labelKey: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { id: "new-doc", icon: IconFilePlus, labelKey: "sidebar4Shortcut1" },
  { id: "search", icon: IconSearch, labelKey: "sidebar4Shortcut2" },
  { id: "invite", icon: IconUserPlus, labelKey: "sidebar4Shortcut3" },
  { id: "calendar", icon: IconCalendar, labelKey: "sidebar4Shortcut4" },
  { id: "reports", icon: IconChartBar, labelKey: "sidebar4Shortcut5" },
];

const RECENT_KEYS = ["sidebar4Recent1", "sidebar4Recent2"] as const;

export function FloatingOverlaySidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border relative h-[560px] w-full overflow-hidden rounded-2xl border">
          <main className="flex h-full flex-col overflow-y-auto p-6 lg:p-8">
            <Typography variant="h3" className="text-2xl font-medium tracking-tight">
              {sb.sidebar4Heading}
            </Typography>
            <Typography variant="body" className="text-muted mt-2 max-w-md">
              {sb.sidebar4Paragraph}
            </Typography>
          </main>

          {open && (
            <button
              type="button"
              aria-label={sb.sidebar4CloseLabel}
              onClick={() => setOpen(false)}
              className="bg-overlay/40 absolute inset-0 z-10"
            />
          )}

          <div
            className={cn(
              "border-border bg-surface absolute bottom-20 left-4 z-20 w-64 origin-bottom-left rounded-2xl border shadow-lg transition-all duration-150",
              open
                ? "animate-scale-in pointer-events-auto opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <Typography variant="bodySmall" className="font-semibold">
                {sb.sidebar4PanelTitle}
              </Typography>
              <button
                type="button"
                aria-label={sb.sidebar4CloseLabel}
                onClick={() => setOpen(false)}
                className="text-muted hover:bg-surface-hover flex size-6 items-center justify-center rounded-md transition-colors"
              >
                <IconX size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              {SHORTCUTS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="text-fg hover:bg-surface-hover flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors"
                  >
                    <ItemIcon size={16} className="text-muted shrink-0" />
                    {sb[item.labelKey]}
                  </button>
                );
              })}
            </div>
            <div className="border-border border-t px-4 py-2">
              <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                {sb.sidebar4RecentLabel}
              </p>
            </div>
            <div className="flex flex-col gap-0.5 p-2 pt-0">
              {RECENT_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="text-muted hover:bg-surface-hover flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                >
                  <IconClock size={14} className="shrink-0" />
                  <span className="truncate">{sb[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="icon-lg"
            aria-label={sb.sidebar4TriggerLabel}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="absolute bottom-4 left-4 z-20 rounded-full"
          >
            <IconLayoutGrid size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
}
