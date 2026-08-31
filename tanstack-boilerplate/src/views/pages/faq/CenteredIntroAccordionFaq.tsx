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
  { qKey: "faq3Q1", aKey: "faq3A1" },
  { qKey: "faq3Q2", aKey: "faq3A2" },
  { qKey: "faq3Q3", aKey: "faq3A3" },
  { qKey: "faq3Q4", aKey: "faq3A4" },
] as const;

export function CenteredIntroAccordionFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <div className="mb-12 flex max-w-3xl flex-col items-start gap-3 text-center md:mx-auto md:items-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq3Heading}
          </h2>
          <p className="text-muted">{f.faq3Intro}</p>
        </div>
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.qKey} value={item.qKey}>
              <AccordionTrigger className="hover:opacity-80 data-[state=open]:hover:opacity-100">
                <span className="py-1">{f[item.qKey]}</span>
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
