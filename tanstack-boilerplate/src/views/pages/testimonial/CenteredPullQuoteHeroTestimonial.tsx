"use client";

import { IconQuoteFilled } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

export function CenteredPullQuoteHeroTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <div
        aria-hidden="true"
        className="bg-brand/10 pointer-events-none absolute top-0 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" pill>
          {tm.testimonial1Eyebrow}
        </Badge>

        <IconQuoteFilled
          size={40}
          aria-hidden="true"
          className="text-brand/25"
        />

        <blockquote className="text-fg text-2xl leading-snug font-medium tracking-tight md:text-4xl md:leading-tight">
          {tm.testimonial1Quote}
        </blockquote>

        <figcaption className="flex flex-col items-center gap-3">
          <Avatar
            fallback={initials(tm.testimonial1Name)}
            size="lg"
            variant="brand"
          />
          <div>
            <p className="text-fg text-sm font-semibold">
              {tm.testimonial1Name}
            </p>
            <p className="text-muted text-sm">{tm.testimonial1Role}</p>
          </div>
        </figcaption>
      </div>
    </section>
  );
}
