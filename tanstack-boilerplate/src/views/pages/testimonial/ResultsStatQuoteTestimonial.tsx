"use client";

import { IconArrowRight, IconQuote, IconTrendingUp } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

export function ResultsStatQuoteTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial8Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial8Intro}</p>
        </div>

        <div className="border-border bg-surface mt-10 grid grid-cols-1 overflow-hidden rounded-2xl border lg:grid-cols-5">
          <div className="bg-brand/5 border-border flex flex-col justify-center gap-6 border-b p-8 lg:col-span-2 lg:border-r lg:border-b-0 lg:p-10">
            <div className="flex items-center gap-2">
              <IconTrendingUp size={18} aria-hidden="true" className="text-brand" />
              <span className="text-fg text-5xl font-bold tracking-tight">
                {tm.testimonial8StatValue}
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              {tm.testimonial8StatLabel}
            </p>
            <div className="text-fg flex items-center gap-2 text-sm font-medium">
              <span className="text-muted">{tm.testimonial8BeforeLabel}</span>
              <span>{tm.testimonial8BeforeValue}</span>
              <IconArrowRight size={14} aria-hidden="true" className="text-muted" />
              <span className="text-muted">{tm.testimonial8AfterLabel}</span>
              <span>{tm.testimonial8AfterValue}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 p-8 lg:col-span-3 lg:p-10">
            <IconQuote size={28} aria-hidden="true" className="text-brand/30" />
            <blockquote className="text-fg text-lg leading-relaxed font-medium lg:text-xl">
              {tm.testimonial8Quote}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar fallback={initials(tm.testimonial8Name)} size="md" variant="brand" />
              <div>
                <p className="text-fg text-sm font-semibold">
                  {tm.testimonial8Name}
                </p>
                <p className="text-muted text-sm">{tm.testimonial8Role}</p>
              </div>
            </figcaption>
          </div>
        </div>
      </div>
    </section>
  );
}
