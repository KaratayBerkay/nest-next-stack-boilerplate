"use client";

import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

interface BadgedQuote {
  id: string;
  companyKey: string;
  quoteKey: string;
  nameKey: string;
  roleKey: string;
}

const CARDS: BadgedQuote[] = [
  { id: "card-1", companyKey: "testimonial7Card1Company", quoteKey: "testimonial7Card1Quote", nameKey: "testimonial7Card1Name", roleKey: "testimonial7Card1Role" },
  { id: "card-2", companyKey: "testimonial7Card2Company", quoteKey: "testimonial7Card2Quote", nameKey: "testimonial7Card2Name", roleKey: "testimonial7Card2Role" },
  { id: "card-3", companyKey: "testimonial7Card3Company", quoteKey: "testimonial7Card3Quote", nameKey: "testimonial7Card3Name", roleKey: "testimonial7Card3Role" },
  { id: "card-4", companyKey: "testimonial7Card4Company", quoteKey: "testimonial7Card4Quote", nameKey: "testimonial7Card4Name", roleKey: "testimonial7Card4Role" },
  { id: "card-5", companyKey: "testimonial7Card5Company", quoteKey: "testimonial7Card5Quote", nameKey: "testimonial7Card5Name", roleKey: "testimonial7Card5Role" },
  { id: "card-6", companyKey: "testimonial7Card6Company", quoteKey: "testimonial7Card6Quote", nameKey: "testimonial7Card6Name", roleKey: "testimonial7Card6Role" },
];

export function LogoBadgeQuoteWallTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial7Intro}</p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={tm.testimonial7GridAria}
        >
          {CARDS.map((card) => (
            <Card key={card.id} variant="default">
              <div role="listitem" className="flex flex-col gap-4 p-6">
                <span className="border-border bg-surface text-fg inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide">
                  <IconBuildingSkyscraper size={14} aria-hidden="true" className="text-muted" />
                  {tm[card.companyKey]}
                </span>
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
