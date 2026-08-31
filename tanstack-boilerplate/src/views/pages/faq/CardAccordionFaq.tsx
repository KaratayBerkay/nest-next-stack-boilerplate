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
  { qKey: "faq9Q1", aKey: "faq9A1" },
  { qKey: "faq9Q2", aKey: "faq9A2" },
  { qKey: "faq9Q3", aKey: "faq9A3" },
  { qKey: "faq9Q4", aKey: "faq9A4" },
] as const;

export function CardAccordionFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h2 className="text-fg mb-10 text-3xl font-bold tracking-tight lg:text-4xl">
          {f.faq9Heading}
        </h2>
        <Accordion type="multiple">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.qKey}
              value={item.qKey}
              className="border-border bg-surface hover:bg-surface-hover data-[state=open]:bg-surface-hover mb-4 rounded-2xl border px-2"
            >
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
