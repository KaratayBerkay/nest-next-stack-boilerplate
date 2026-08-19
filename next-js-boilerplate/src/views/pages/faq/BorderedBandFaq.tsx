"use client";

import { IconChevronDown, IconQuestionMark } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_ITEMS = [
  { qKey: "faq10Q1", aKey: "faq10A1" },
  { qKey: "faq10Q2", aKey: "faq10A2" },
  { qKey: "faq10Q3", aKey: "faq10A3" },
  { qKey: "faq10Q4", aKey: "faq10A4" },
] as const;

export function BorderedBandFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="border-border w-full border-y py-16 lg:py-24">
      <div className="border-border mx-auto flex max-w-6xl flex-col px-6 lg:border-x lg:px-16">
        <div className="flex max-w-2xl flex-col items-start gap-5 pt-8 lg:pt-16">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            <IconQuestionMark size={12} aria-hidden="true" />
            {f.faq10Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {f.faq10Title}
          </h2>
          <p className="text-muted">
            {f.faq10IntroLead}{" "}
            <span className="text-fg underline underline-offset-4">
              {f.faq10IntroAccent}
            </span>{" "}
            {f.faq10IntroTail}
          </p>
        </div>
        <div className="mx-auto w-full max-w-3xl py-12 lg:py-16">
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.qKey}
                value={item.qKey}
                className="border-border bg-surface hover:bg-surface-hover data-[state=open]:bg-surface-hover mb-3 overflow-hidden rounded-xl border"
              >
                <AccordionTrigger className="tracking-tight">
                  <span>{f[item.qKey]}</span>
                  <IconChevronDown
                    size={16}
                    className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                  />
                </AccordionTrigger>
                <AccordionContent className="tracking-tight">
                  {f[item.aKey]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
