"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconChevronDown,
  IconClock,
  IconHeadset,
  IconPhoneCall,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";

const SUPPORT_ITEMS = [
  {
    id: "chat",
    icon: IconHeadset,
    labelKey: "ecommerceFooter19SupportChatLabel",
    valueKey: "ecommerceFooter19SupportChatValue",
  },
  {
    id: "call",
    icon: IconPhoneCall,
    labelKey: "ecommerceFooter19SupportCallLabel",
    valueKey: "ecommerceFooter19SupportCallValue",
  },
  {
    id: "hours",
    icon: IconClock,
    labelKey: "ecommerceFooter19SupportHoursLabel",
    valueKey: "ecommerceFooter19SupportHoursValue",
  },
] as const;

interface FooterLink {
  id: string;
  labelKey: string;
}

interface FooterGroup {
  id: string;
  titleKey: string;
  links: FooterLink[];
}

const GROUPS: FooterGroup[] = [
  {
    id: "shopping",
    titleKey: "ecommerceFooter19Group1Title",
    links: [
      { id: "new", labelKey: "ecommerceFooter19Group1Link1" },
      { id: "best", labelKey: "ecommerceFooter19Group1Link2" },
      { id: "gift-cards", labelKey: "ecommerceFooter19Group1Link3" },
    ],
  },
  {
    id: "orders",
    titleKey: "ecommerceFooter19Group2Title",
    links: [
      { id: "track", labelKey: "ecommerceFooter19Group2Link1" },
      { id: "return", labelKey: "ecommerceFooter19Group2Link2" },
      { id: "shipping", labelKey: "ecommerceFooter19Group2Link3" },
    ],
  },
  {
    id: "about",
    titleKey: "ecommerceFooter19Group3Title",
    links: [
      { id: "story", labelKey: "ecommerceFooter19Group3Link1" },
      { id: "careers", labelKey: "ecommerceFooter19Group3Link2" },
      { id: "press", labelKey: "ecommerceFooter19Group3Link3" },
    ],
  },
];

export function SupportBrandPanelEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="border-border border-b">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 sm:grid-cols-3 lg:px-8">
          {SUPPORT_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <item.icon
                size={20}
                className="text-brand shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-fg text-sm font-medium">
                  {f[item.labelKey]}
                </span>
                <span className="text-muted text-xs">{f[item.valueKey]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <Accordion
          type="multiple"
          defaultValue={["shopping"]}
          className="border-border overflow-hidden rounded-xl border"
        >
          {GROUPS.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="group">
                <span className="text-fg text-sm font-semibold">
                  {f[group.titleKey]}
                </span>
                <IconChevronDown
                  size={16}
                  className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href="#"
                        className="text-muted hover:text-fg text-sm"
                      >
                        {f[link.labelKey]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="bg-brand/10 border-brand/30 mt-10 flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.ecommerceFooter19PanelTitle}
            </span>
            <p className="text-muted max-w-md text-sm">
              {f.ecommerceFooter19PanelCopy}
            </p>
          </div>
          <Button
            variant="primary"
            rightIcon={<IconArrowRight size={16} aria-hidden="true" />}
            className="shrink-0"
          >
            {f.ecommerceFooter19PanelCta}
          </Button>
        </div>

        <p className="text-muted mt-8 text-xs">
          {f.ecommerceFooter19Copyright}
        </p>
      </div>
    </footer>
  );
}
