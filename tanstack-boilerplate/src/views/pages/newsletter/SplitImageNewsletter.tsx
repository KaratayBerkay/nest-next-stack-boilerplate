"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithNewsletterMessages } from "@/types/pages/newsletter/NewsletterMessages-types";

const BENEFITS = [
  { id: "benefit-1", textKey: "newsletter2Benefit1" },
  { id: "benefit-2", textKey: "newsletter2Benefit2" },
  { id: "benefit-3", textKey: "newsletter2Benefit3" },
] as const;

export function SplitImageNewsletter() {
  const t = useMessages("pages") as unknown as PagesWithNewsletterMessages;
  const n = t.newsletter;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-3xl border">
          <Image
            src={placeholderImage("newsletter-2-hero", "4x5")}
            alt={n.newsletter2ImageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {n.newsletter2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {n.newsletter2Heading}
          </h2>
          <p className="text-muted text-base">{n.newsletter2Body}</p>
          <ul className="flex flex-col gap-2.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit.id} className="flex items-center gap-2.5">
                <span className="bg-brand/10 text-brand flex size-5 shrink-0 items-center justify-center rounded-full">
                  <IconCheck size={12} aria-hidden="true" />
                </span>
                <span className="text-fg text-sm">{n[benefit.textKey]}</span>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <Input
              type="email"
              required
              placeholder={n.newsletter2Placeholder}
              aria-label={n.newsletter2Placeholder}
              className="flex-1"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              {n.newsletter2Submit}
            </Button>
          </form>
          <span className="text-muted text-xs">{n.newsletter2FinePrint}</span>
        </div>
      </div>
    </section>
  );
}
