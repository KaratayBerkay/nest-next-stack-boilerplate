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

const FAQ_ITEMS = [
  { qKey: "faq1Q1", aKey: "faq1A1" },
  { qKey: "faq1Q2", aKey: "faq1A2" },
  { qKey: "faq1Q3", aKey: "faq1A3" },
  { qKey: "faq1Q4", aKey: "faq1A4" },
] as const;

export function CenteredAccordionFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h2 className="text-fg mb-10 text-center text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.faq1Heading}
        </h2>
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item) => (
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
    </section>
  );
}
