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

const GENERAL_ITEMS = [
  { qKey: "faq8GeneralQ1", aKey: "faq8GeneralA1" },
  { qKey: "faq8GeneralQ2", aKey: "faq8GeneralA2" },
  { qKey: "faq8GeneralQ3", aKey: "faq8GeneralA3" },
  { qKey: "faq8GeneralQ4", aKey: "faq8GeneralA4" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq8BillingQ1", aKey: "faq8BillingA1" },
  { qKey: "faq8BillingQ2", aKey: "faq8BillingA2" },
  { qKey: "faq8BillingQ3", aKey: "faq8BillingA3" },
  { qKey: "faq8BillingQ4", aKey: "faq8BillingA4" },
] as const;

export function CategorizedTwoBandFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-fg mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.faq8Heading}
        </h2>
        <div className="border-border mt-10 grid gap-8 border-t pt-10 md:grid-cols-3 lg:gap-12">
          <h3 className="text-fg text-base font-medium md:col-span-1">
            {f.faq8GeneralLabel}
          </h3>
          <Accordion type="single" collapsible className="md:col-span-2">
            {GENERAL_ITEMS.map((item) => (
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
        <div className="border-border mt-14 grid gap-8 border-t pt-10 md:grid-cols-3 lg:gap-12">
          <h3 className="text-fg text-base font-medium md:col-span-1">
            {f.faq8BillingLabel}
          </h3>
          <Accordion type="single" collapsible className="md:col-span-2">
            {BILLING_ITEMS.map((item) => (
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
      </div>
    </section>
  );
}
