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

const START_ITEMS = [
  { qKey: "faq14Cat1Q1", aKey: "faq14Cat1A1" },
  { qKey: "faq14Cat1Q2", aKey: "faq14Cat1A2" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq14Cat2Q1", aKey: "faq14Cat2A1" },
  { qKey: "faq14Cat2Q2", aKey: "faq14Cat2A2" },
  { qKey: "faq14Cat2Q3", aKey: "faq14Cat2A3" },
] as const;

const SECURITY_ITEMS = [
  { qKey: "faq14Cat3Q1", aKey: "faq14Cat3A1" },
  { qKey: "faq14Cat3Q2", aKey: "faq14Cat3A2" },
] as const;

interface FaqCard {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_CARDS: FaqCard[] = [
  { id: "starting", labelKey: "faq14Cat1Label", items: START_ITEMS },
  { id: "billing", labelKey: "faq14Cat2Label", items: BILLING_ITEMS },
  { id: "security", labelKey: "faq14Cat3Label", items: SECURITY_ITEMS },
];

export function CenteredCategoryCardsFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq14Title}
          </h2>
          <p className="text-muted max-w-xl">{f.faq14Subtitle}</p>
        </div>
        <div className="flex flex-col gap-6">
          {FAQ_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface rounded-2xl border p-6 lg:p-8"
            >
              <h3 className="text-fg mb-4 text-sm font-semibold tracking-wide uppercase">
                {f[card.labelKey]}
              </h3>
              <Accordion type="single" collapsible>
                {card.items.map((item) => (
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
