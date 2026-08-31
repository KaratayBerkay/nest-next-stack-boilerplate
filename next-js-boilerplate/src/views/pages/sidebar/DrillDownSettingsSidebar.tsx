"use client";

import { useState } from "react";
import {
  IconBellRinging,
  IconChevronLeft,
  IconChevronRight,
  IconPalette,
  IconShieldLock,
  IconUserCircle,
} from "@tabler/icons-react";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface SwitchItem {
  id: string;
  type: "switch";
  labelKey: string;
}

interface LinkItem {
  id: string;
  type: "link";
  labelKey: string;
}

type CategoryItem = SwitchItem | LinkItem;

interface Category {
  id: string;
  icon: typeof IconUserCircle;
  titleKey: string;
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "account",
    icon: IconUserCircle,
    titleKey: "sidebar9CategoryAccount",
    items: [
      { id: "edit-profile", type: "link", labelKey: "sidebar9AccountItem1" },
      { id: "change-password", type: "link", labelKey: "sidebar9AccountItem2" },
    ],
  },
  {
    id: "notifications",
    icon: IconBellRinging,
    titleKey: "sidebar9CategoryNotifications",
    items: [
      { id: "email", type: "switch", labelKey: "sidebar9NotificationsItem1" },
      { id: "push", type: "switch", labelKey: "sidebar9NotificationsItem2" },
      { id: "digest", type: "switch", labelKey: "sidebar9NotificationsItem3" },
    ],
  },
  {
    id: "privacy",
    icon: IconShieldLock,
    titleKey: "sidebar9CategoryPrivacy",
    items: [
      { id: "2fa", type: "switch", labelKey: "sidebar9PrivacyItem1" },
      { id: "download-data", type: "link", labelKey: "sidebar9PrivacyItem2" },
    ],
  },
  {
    id: "appearance",
    icon: IconPalette,
    titleKey: "sidebar9CategoryAppearance",
    items: [
      {
        id: "reduce-motion",
        type: "switch",
        labelKey: "sidebar9AppearanceItem1",
      },
      { id: "theme", type: "link", labelKey: "sidebar9AppearanceItem2" },
    ],
  },
];

export function DrillDownSettingsSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    digest: false,
    "2fa": false,
    "reduce-motion": false,
  });

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) ?? null;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 lg:px-8">
        <div className="bg-surface border-border h-[560px] w-full overflow-hidden rounded-2xl border">
          <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
            {activeCategory ? (
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className="text-muted hover:bg-surface-hover flex items-center gap-1 rounded-lg py-1.5 pr-2 pl-1 text-sm transition-colors"
              >
                <IconChevronLeft size={16} />
                {sb.sidebar9BackLabel}
              </button>
            ) : (
              <Typography variant="bodyLarge" className="font-semibold">
                {sb.sidebar9RootTitle}
              </Typography>
            )}
          </div>

          {activeCategory ? (
            <div className="animate-fade-in-left h-[calc(100%-3.5rem)] overflow-y-auto p-4">
              <Typography
                variant="h3"
                className="mb-4 px-1 text-lg font-medium"
              >
                {sb[activeCategory.titleKey]}
              </Typography>
              <div className="flex flex-col gap-1">
                {activeCategory.items.map((item) =>
                  item.type === "switch" ? (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg px-3 py-3"
                    >
                      <span className="text-fg text-sm">
                        {sb[item.labelKey]}
                      </span>
                      <Switch
                        checked={switches[item.id] ?? false}
                        onChange={(event) =>
                          setSwitches((prev) => ({
                            ...prev,
                            [item.id]: event.target.checked,
                          }))
                        }
                        aria-label={sb[item.labelKey]}
                      />
                    </div>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      className="text-fg hover:bg-surface-hover flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors"
                    >
                      {sb[item.labelKey]}
                      <IconChevronRight size={16} className="text-muted" />
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
              <p className="text-muted mb-3 px-1 text-sm">
                {sb.sidebar9RootHint}
              </p>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategoryId(category.id)}
                      className={cn(
                        "hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
                      )}
                    >
                      <span className="border-border bg-bg flex size-9 shrink-0 items-center justify-center rounded-lg border">
                        <CategoryIcon size={18} className="text-fg" />
                      </span>
                      <span className="text-fg flex-1 font-medium">
                        {sb[category.titleKey]}
                      </span>
                      <IconChevronRight size={16} className="text-muted" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
