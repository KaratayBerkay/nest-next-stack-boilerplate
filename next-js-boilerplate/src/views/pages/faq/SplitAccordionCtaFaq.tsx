"use client";

import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_URL = "#" as const;

const FAQ_ITEMS = [
  { qKey: "faq7Q1", aKey: "faq7A1" },
  { qKey: "faq7Q2", aKey: "faq7A2" },
  { qKey: "faq7Q3", aKey: "faq7A3" },
  { qKey: "faq7Q4", aKey: "faq7A4" },
] as const;

export function SplitAccordionCtaFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq7Heading1}
            <span className="text-muted block">{f.faq7Heading2}</span>
          </h2>
          <p className="text-muted leading-relaxed">{f.faq7Paragraph}</p>
          <Button asChild variant="outline" size="lg">
            <a href={FAQ_URL}>{f.faq7ButtonLabel}</a>
          </Button>
        </div>
        <Accordion type="multiple">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.qKey} value={item.qKey}>
              <AccordionTrigger>
                <span className="text-left">{f[item.qKey]}</span>
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
