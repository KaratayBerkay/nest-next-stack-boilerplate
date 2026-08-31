"use client";

import { IconQuote } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

interface GridQuote {
  id: string;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
}

const CARDS: GridQuote[] = [
  {
    id: "card-1",
    nameKey: "testimonial2Card1Name",
    roleKey: "testimonial2Card1Role",
    quoteKey: "testimonial2Card1Quote",
  },
  {
    id: "card-2",
    nameKey: "testimonial2Card2Name",
    roleKey: "testimonial2Card2Role",
    quoteKey: "testimonial2Card2Quote",
  },
  {
    id: "card-3",
    nameKey: "testimonial2Card3Name",
    roleKey: "testimonial2Card3Role",
    quoteKey: "testimonial2Card3Quote",
  },
  {
    id: "card-4",
    nameKey: "testimonial2Card4Name",
    roleKey: "testimonial2Card4Role",
    quoteKey: "testimonial2Card4Quote",
  },
  {
    id: "card-5",
    nameKey: "testimonial2Card5Name",
    roleKey: "testimonial2Card5Role",
    quoteKey: "testimonial2Card5Quote",
  },
  {
    id: "card-6",
    nameKey: "testimonial2Card6Name",
    roleKey: "testimonial2Card6Role",
    quoteKey: "testimonial2Card6Quote",
  },
];

export function ColumnQuoteGridTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial2Intro}</p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={tm.testimonial2GridAria}
        >
          {CARDS.map((card) => (
            <Card key={card.id} variant="default">
              <div role="listitem" className="flex flex-col gap-4 p-6">
                <IconQuote
                  size={24}
                  aria-hidden="true"
                  className="text-brand/40"
                />
                <p className="text-fg flex-1 text-sm leading-relaxed">
                  {tm[card.quoteKey]}
                </p>
                <div className="flex items-center gap-3">
                  <Avatar fallback={initials(tm[card.nameKey])} size="sm" />
                  <div>
                    <p className="text-fg text-sm font-semibold">
                      {tm[card.nameKey]}
                    </p>
                    <p className="text-muted text-xs">{tm[card.roleKey]}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
