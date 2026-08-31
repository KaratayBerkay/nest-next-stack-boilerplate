"use client";

import { IconArrowUpRight, IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const SUPPORT_URL = "#" as const;

const FAQ_ITEMS = [
  { qKey: "faq4Q1", aKey: "faq4A1" },
  { qKey: "faq4Q2", aKey: "faq4A2" },
  { qKey: "faq4Q3", aKey: "faq4A3" },
  { qKey: "faq4Q4", aKey: "faq4A4" },
] as const;

export function BadgeAccordionFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start gap-4">
          <Badge>{f.faq4Badge}</Badge>
          <div className="flex w-full flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.faq4Title}
            </h2>
            <p className="text-muted">{f.faq4Subtitle}</p>
          </div>
          <a
            href={SUPPORT_URL}
            className="text-muted group hover:text-fg inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {f.faq4SupportLabel}
            <IconArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
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
