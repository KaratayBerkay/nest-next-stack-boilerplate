"use client";

import Image from "next/image";
import { IconQuoteFilled } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

export function SplitImageQuoteTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border bg-surface grid grid-cols-1 overflow-hidden rounded-2xl border lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full lg:aspect-auto">
            <Image
              src={placeholderImage("testimonial5-split", "4x5")}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {tm.testimonial5Eyebrow}
            </span>
            <IconQuoteFilled
              size={32}
              aria-hidden="true"
              className="text-brand/30"
            />
            <blockquote className="text-fg text-xl leading-relaxed font-medium lg:text-2xl">
              {tm.testimonial5Quote}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar fallback={initials(tm.testimonial5Name)} size="md" variant="brand" />
              <div>
                <p className="text-fg text-sm font-semibold">
                  {tm.testimonial5Name}
                </p>
                <p className="text-muted text-sm">{tm.testimonial5Role}</p>
              </div>
            </figcaption>
          </div>
        </div>
      </div>
    </section>
  );
}
