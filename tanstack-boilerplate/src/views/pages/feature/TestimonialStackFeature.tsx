"use client";

import Image from "next/image";
import { IconArrowRight, IconQuote } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const AVATAR_SRC = "/img/placeholders/ph-1x1-7.webp" as const;

const SUPPORTING_QUOTE_KEYS = ["feature281Quote2", "feature281Quote3"] as const;

export function TestimonialStackFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature281Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature281Heading}
          </h2>
          <p className="text-muted">{f.feature281Intro}</p>
        </div>
        <figure className="border-border bg-surface mx-auto mt-12 flex max-w-3xl flex-col items-center gap-6 rounded-lg border p-8 text-center lg:p-10">
          <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-md">
            <IconQuote size={22} aria-hidden="true" />
          </span>
          <blockquote className="text-fg text-lg leading-relaxed">
            {f.feature281Quote}
          </blockquote>
          <figcaption className="flex flex-col items-center gap-3">
            <Image
              src={AVATAR_SRC}
              alt={f.feature281Author}
              width={96}
              height={96}
              className="size-12 rounded-full object-cover"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-fg text-sm font-semibold">
                {f.feature281Author}
              </span>
              <span className="text-muted text-xs">{f.feature281Role}</span>
            </div>
          </figcaption>
          <a
            href={LINK_URL}
            className="text-fg group inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {f.feature281ReadMore}
            <IconArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </figure>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {SUPPORTING_QUOTE_KEYS.map((quoteKey) => (
            <blockquote
              key={quoteKey}
              className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-5"
            >
              <span className="bg-brand/10 text-brand flex size-8 items-center justify-center rounded-md">
                <IconQuote size={14} aria-hidden="true" />
              </span>
              <p className="text-muted text-sm leading-relaxed">
                {f[quoteKey]}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
