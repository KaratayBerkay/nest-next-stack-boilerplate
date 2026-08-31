"use client";

import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const CONTACT_URL = "#" as const;

const FAQ_ITEMS = [
  { qKey: "faq17Q1", aKey: "faq17A1" },
  { qKey: "faq17Q2", aKey: "faq17A2" },
  { qKey: "faq17Q3", aKey: "faq17A3" },
  { qKey: "faq17Q4", aKey: "faq17A4" },
] as const;

export function ProfileContactFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-6 lg:col-span-4">
          <div className="flex items-center gap-4">
            <span className="bg-brand text-brand-fg flex size-14 items-center justify-center rounded-xl text-base font-semibold">
              {f.faq17Initials}
            </span>
            <div>
              <p className="text-fg text-sm font-semibold">{f.faq17Name}</p>
              <p className="text-muted text-xs">{f.faq17Role}</p>
            </div>
          </div>
          <div className="border-border bg-surface flex w-full flex-col items-start gap-3 rounded-2xl border p-6">
            <h3 className="text-fg text-base font-semibold">
              {f.faq17ContactHeading}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.faq17ContactCopy}
            </p>
            <a
              href={CONTACT_URL}
              className="text-fg group inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              {f.faq17ContactLabel}
              <IconExternalLink
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
        <Accordion type="multiple" className="lg:col-span-8">
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
