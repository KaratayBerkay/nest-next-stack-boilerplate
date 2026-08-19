"use client";

import { useState } from "react";
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
  { qKey: "faq19Cat1Q1", aKey: "faq19Cat1A1" },
  { qKey: "faq19Cat1Q2", aKey: "faq19Cat1A2" },
  { qKey: "faq19Cat1Q3", aKey: "faq19Cat1A3" },
  { qKey: "faq19Cat1Q4", aKey: "faq19Cat1A4" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq19Cat2Q1", aKey: "faq19Cat2A1" },
  { qKey: "faq19Cat2Q2", aKey: "faq19Cat2A2" },
  { qKey: "faq19Cat2Q3", aKey: "faq19Cat2A3" },
] as const;

const DATA_ITEMS = [
  { qKey: "faq19Cat3Q1", aKey: "faq19Cat3A1" },
  { qKey: "faq19Cat3Q2", aKey: "faq19Cat3A2" },
  { qKey: "faq19Cat3Q3", aKey: "faq19Cat3A3" },
] as const;

interface FaqCategory {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "general", labelKey: "faq19Cat1Label", items: GENERAL_ITEMS },
  { id: "billing", labelKey: "faq19Cat2Label", items: BILLING_ITEMS },
  { id: "data", labelKey: "faq19Cat3Label", items: DATA_ITEMS },
];

export function CategoryListAccordionFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;
  const [activeCat, setActiveCat] = useState(FAQ_CATEGORIES[0].id);
  const activeItems =
    FAQ_CATEGORIES.find((category) => category.id === activeCat)?.items ?? [];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap gap-2">
          {FAQ_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCat(category.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                activeCat === category.id
                  ? "border-border bg-surface-hover text-fg font-medium"
                  : "border-border text-muted hover:bg-surface-hover hover:text-fg"
              }`}
            >
              {f[category.labelKey]}
            </button>
          ))}
        </div>
        <Accordion type="single" collapsible>
          {activeItems.map((item) => (
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
