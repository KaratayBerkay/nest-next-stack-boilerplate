"use client";

import Image from "next/image";
import {
  IconMessage2,
  IconQuote,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const PRIMARY_IMAGE_SRC =
  "https://picsum.photos/seed/feature4-primary/800/600" as const;
const SECONDARY_IMAGE_SRC =
  "https://picsum.photos/seed/feature4-secondary/800/600" as const;
const AVATAR_SRC = "https://picsum.photos/seed/feature4-avatar/96/96" as const;

export function CollaborationQuoteFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature4Heading}
          </h2>
        </div>
        <div className="mt-12 grid gap-6">
          <article className="border-border bg-surface overflow-hidden rounded-xl border">
            <div className="flex flex-col gap-4 p-8 lg:p-10">
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-md">
                <IconUsers size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-2xl font-semibold tracking-tight">
                {f.feature4Card1Title}
              </h3>
              <p className="text-muted max-w-2xl leading-relaxed">
                {f.feature4Card1Body}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-t-xl">
              <Image
                src={PRIMARY_IMAGE_SRC}
                alt={f.feature4Card1ImageAlt}
                width={800}
                height={600}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </article>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="border-border bg-surface flex flex-col overflow-hidden rounded-xl border">
              <div className="flex flex-col gap-4 p-8">
                <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-md">
                  <IconMessage2 size={20} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-xl font-semibold tracking-tight">
                  {f.feature4Card2Title}
                </h3>
                <p className="text-muted leading-relaxed">
                  {f.feature4Card2Body}
                </p>
              </div>
              <div className="relative mt-auto overflow-hidden rounded-t-xl">
                <Image
                  src={SECONDARY_IMAGE_SRC}
                  alt={f.feature4Card2ImageAlt}
                  width={800}
                  height={600}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </article>
            <figure className="border-border bg-surface flex flex-col gap-6 rounded-xl border p-8 lg:p-10">
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-md">
                <IconSparkles size={20} aria-hidden="true" />
              </span>
              <span className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-md">
                <IconQuote size={16} aria-hidden="true" />
              </span>
              <blockquote className="text-fg text-2xl leading-snug font-semibold tracking-tight">
                {f.feature4Quote}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <Image
                  src={AVATAR_SRC}
                  alt={f.feature4QuoteAvatarAlt}
                  width={96}
                  height={96}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-sm font-semibold">
                    {f.feature4QuoteAuthor}
                  </span>
                  <span className="text-muted text-xs">
                    {f.feature4QuoteRole}
                  </span>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
