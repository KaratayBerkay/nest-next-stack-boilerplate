"use client";

import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

interface AccordionQuote {
  id: string;
  nameKey: string;
  roleKey: string;
  teaserKey: string;
  quoteKey: string;
}

const ITEMS: AccordionQuote[] = [
  { id: "item-1", nameKey: "testimonial9Item1Name", roleKey: "testimonial9Item1Role", teaserKey: "testimonial9Item1Teaser", quoteKey: "testimonial9Item1Quote" },
  { id: "item-2", nameKey: "testimonial9Item2Name", roleKey: "testimonial9Item2Role", teaserKey: "testimonial9Item2Teaser", quoteKey: "testimonial9Item2Quote" },
  { id: "item-3", nameKey: "testimonial9Item3Name", roleKey: "testimonial9Item3Role", teaserKey: "testimonial9Item3Teaser", quoteKey: "testimonial9Item3Quote" },
  { id: "item-4", nameKey: "testimonial9Item4Name", roleKey: "testimonial9Item4Role", teaserKey: "testimonial9Item4Teaser", quoteKey: "testimonial9Item4Quote" },
  { id: "item-5", nameKey: "testimonial9Item5Name", roleKey: "testimonial9Item5Role", teaserKey: "testimonial9Item5Teaser", quoteKey: "testimonial9Item5Quote" },
];

export function ExpandableQuoteAccordionTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial9Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial9Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial9Intro}</p>
        </div>

        <div className="border-border bg-surface mt-10 overflow-hidden rounded-2xl border">
          <Accordion type="single" collapsible defaultValue={ITEMS[0].id}>
            {ITEMS.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="group gap-4 px-5">
                  <div className="flex flex-1 items-center gap-3 text-left">
                    <Avatar fallback={initials(tm[item.nameKey])} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-fg text-sm font-semibold">
                        {tm[item.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {tm[item.roleKey]}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted hidden max-w-xs truncate text-sm italic sm:block group-data-[state=open]:hidden">
                    {tm[item.teaserKey]}
                  </span>
                  <IconChevronDown
                    size={18}
                    aria-hidden="true"
                    className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-fg text-sm leading-relaxed">
                    {tm[item.quoteKey]}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
