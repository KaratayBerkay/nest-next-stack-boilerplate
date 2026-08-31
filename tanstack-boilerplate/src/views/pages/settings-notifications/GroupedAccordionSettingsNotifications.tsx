"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconMessageCircle,
  IconShieldCheck,
  IconSpeakerphone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsNotificationsMessages } from "@/types/pages/settings-notifications/SettingsNotificationsMessages-types";

interface CategoryItem {
  id: string;
  labelKey: string;
  descKey: string;
  defaultChecked: boolean;
}

interface Category {
  id: string;
  icon: Icon;
  nameKey: string;
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "account",
    icon: IconShieldCheck,
    nameKey: "settingsNotifications3Cat1Name",
    items: [
      {
        id: "account-signin",
        labelKey: "settingsNotifications3Cat1Item1Label",
        descKey: "settingsNotifications3Cat1Item1Desc",
        defaultChecked: true,
      },
      {
        id: "account-password",
        labelKey: "settingsNotifications3Cat1Item2Label",
        descKey: "settingsNotifications3Cat1Item2Desc",
        defaultChecked: true,
      },
    ],
  },
  {
    id: "social",
    icon: IconMessageCircle,
    nameKey: "settingsNotifications3Cat2Name",
    items: [
      {
        id: "social-replies",
        labelKey: "settingsNotifications3Cat2Item1Label",
        descKey: "settingsNotifications3Cat2Item1Desc",
        defaultChecked: true,
      },
      {
        id: "social-mentions",
        labelKey: "settingsNotifications3Cat2Item2Label",
        descKey: "settingsNotifications3Cat2Item2Desc",
        defaultChecked: false,
      },
    ],
  },
  {
    id: "product",
    icon: IconSpeakerphone,
    nameKey: "settingsNotifications3Cat3Name",
    items: [
      {
        id: "product-features",
        labelKey: "settingsNotifications3Cat3Item1Label",
        descKey: "settingsNotifications3Cat3Item1Desc",
        defaultChecked: true,
      },
      {
        id: "product-promotions",
        labelKey: "settingsNotifications3Cat3Item2Label",
        descKey: "settingsNotifications3Cat3Item2Desc",
        defaultChecked: false,
      },
    ],
  },
];

const INITIAL_STATE: Record<string, boolean> = Object.fromEntries(
  CATEGORIES.flatMap((cat) => cat.items.map((item) => [item.id, item.defaultChecked])),
);

export function GroupedAccordionSettingsNotifications() {
  const t = useMessages("pages") as unknown as PagesWithSettingsNotificationsMessages;
  const sn = t.settingsNotifications;

  const [values, setValues] = useState<Record<string, boolean>>(INITIAL_STATE);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-fg text-base font-semibold">
              {sn.settingsNotifications3Heading}
            </h3>
            <p className="text-muted text-sm">{sn.settingsNotifications3Subheading}</p>
          </div>
          <Accordion
            type="multiple"
            defaultValue={["account"]}
            className="border-border rounded-xl border"
          >
            {CATEGORIES.map((category) => {
              const onCount = category.items.filter((item) => values[item.id]).length;
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="group">
                    <span className="flex items-center gap-2">
                      <category.icon
                        size={16}
                        className="text-muted"
                        aria-hidden="true"
                      />
                      {sn[category.nameKey]}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant="soft" size="sm">
                        {sn.settingsNotifications3CategoryCountLabel
                          .replace("{count}", String(onCount))
                          .replace("{total}", String(category.items.length))}
                      </Badge>
                      <IconChevronDown
                        size={16}
                        aria-hidden="true"
                        className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-fg text-sm font-medium">
                              {sn[item.labelKey]}
                            </span>
                            <span className="text-muted text-xs">
                              {sn[item.descKey]}
                            </span>
                          </div>
                          <Switch
                            checked={values[item.id]}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [item.id]: e.target.checked,
                              }))
                            }
                            switchSize="sm"
                            aria-label={sn[item.labelKey]}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
