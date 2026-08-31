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

const CONTACT_URL = "#" as const;

const START_ITEMS = [
  { qKey: "faq20Cat1Q1", aKey: "faq20Cat1A1" },
  { qKey: "faq20Cat1Q2", aKey: "faq20Cat1A2" },
  { qKey: "faq20Cat1Q3", aKey: "faq20Cat1A3" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq20Cat2Q1", aKey: "faq20Cat2A1" },
  { qKey: "faq20Cat2Q2", aKey: "faq20Cat2A2" },
  { qKey: "faq20Cat2Q3", aKey: "faq20Cat2A3" },
] as const;

const SECURITY_ITEMS = [
  { qKey: "faq20Cat3Q1", aKey: "faq20Cat3A1" },
  { qKey: "faq20Cat3Q2", aKey: "faq20Cat3A2" },
  { qKey: "faq20Cat3Q3", aKey: "faq20Cat3A3" },
] as const;

interface FaqGroup {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_GROUPS: FaqGroup[] = [
  { id: "starting", labelKey: "faq20Cat1Label", items: START_ITEMS },
  { id: "billing", labelKey: "faq20Cat2Label", items: BILLING_ITEMS },
  { id: "security", labelKey: "faq20Cat3Label", items: SECURITY_ITEMS },
];

export function TwoColumnCategorizedFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-4 lg:col-span-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq20Heading}
          </h2>
          <p className="text-muted">
            {f.faq20Description}{" "}
            <a
              href={CONTACT_URL}
              className="text-fg hover:text-brand font-medium underline underline-offset-4"
            >
              {f.faq20ContactLabel}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-12 lg:col-span-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="text-muted border-border border-b pb-3 text-sm font-medium tracking-wide uppercase">
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
