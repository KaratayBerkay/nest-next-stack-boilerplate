"use client";

import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const BILLING_ITEMS = [
  { qKey: "faq11Cat1Q1", aKey: "faq11Cat1A1" },
  { qKey: "faq11Cat1Q2", aKey: "faq11Cat1A2" },
  { qKey: "faq11Cat1Q3", aKey: "faq11Cat1A3" },
] as const;

const ACCOUNT_ITEMS = [
  { qKey: "faq11Cat2Q1", aKey: "faq11Cat2A1" },
  { qKey: "faq11Cat2Q2", aKey: "faq11Cat2A2" },
  { qKey: "faq11Cat2Q3", aKey: "faq11Cat2A3" },
] as const;

const SECURITY_ITEMS = [
  { qKey: "faq11Cat3Q1", aKey: "faq11Cat3A1" },
  { qKey: "faq11Cat3Q2", aKey: "faq11Cat3A2" },
  { qKey: "faq11Cat3Q3", aKey: "faq11Cat3A3" },
] as const;

interface FaqGroup {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_GROUPS: FaqGroup[] = [
  { id: "billing", labelKey: "faq11Cat1Label", items: BILLING_ITEMS },
  { id: "account", labelKey: "faq11Cat2Label", items: ACCOUNT_ITEMS },
  { id: "security", labelKey: "faq11Cat3Label", items: SECURITY_ITEMS },
];

export function SplitIntroCategoriesFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-4 lg:col-span-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq11Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.faq11Intro}</p>
        </div>
        <div className="flex flex-col gap-12 lg:col-span-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col gap-4">
              <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                {f[group.labelKey]}
              </h3>
              <Accordion type="single" collapsible>
                {group.items.map((item) => (
                  <AccordionItem key={item.qKey} value={item.qKey}>
                    <AccordionTrigger>
                      <span>{f[item.qKey]}</span>
                      <IconChevronDown
                        size={16}
                        className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                      />
                    </AccordionTrigger>
                    <AccordionContent>{f[item.aKey]}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
