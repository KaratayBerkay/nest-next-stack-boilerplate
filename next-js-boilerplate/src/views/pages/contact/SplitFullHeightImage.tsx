"use client";

import Image from "next/image";
import { IconArrowUpRight, IconMail, IconPhone } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;
const PHONE = "+1 (555) 000-0000" as const;
const EMAIL = "hello@acme.com" as const;
const IMAGE_SRC =
  "https://picsum.photos/seed/contact19-studio/1200/1600" as const;

export function SplitFullHeightImage() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="flex flex-col gap-8 py-4 lg:py-0 lg:pr-16">
          <div className="flex flex-col gap-6">
            <Typography
              variant="h2"
              className="text-5xl font-medium tracking-tighter sm:text-6xl lg:text-7xl"
            >
              {co.contact19Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.contact19Description}
            </Typography>
          </div>
          <a
            href={LINK_URL}
            className="group border-border hover:bg-surface-hover inline-flex w-fit items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          >
            {co.contact19Cta}
            <IconArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
          <div className="mt-auto flex flex-col gap-5 pt-6 lg:pt-0">
            <a
              href={`tel:${PHONE}`}
              className="group flex w-fit flex-col gap-1.5"
            >
              <span className="text-muted text-sm">
                {co.contact19PhoneLabel}
              </span>
              <span className="text-fg inline-flex items-center gap-3 text-2xl font-semibold tracking-tight underline-offset-4 group-hover:underline lg:text-3xl">
                <span className="border-border bg-surface flex size-10 items-center justify-center rounded-full border">
                  <IconPhone size={16} aria-hidden="true" />
                </span>
                {PHONE}
              </span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="group flex w-fit flex-col gap-1.5"
            >
              <span className="text-muted text-sm">
                {co.contact19EmailLabel}
              </span>
              <span className="text-fg inline-flex items-center gap-3 text-2xl font-semibold tracking-tight underline-offset-4 group-hover:underline lg:text-3xl">
                <span className="border-border bg-surface flex size-10 items-center justify-center rounded-full border">
                  <IconMail size={16} aria-hidden="true" />
                </span>
                {EMAIL}
              </span>
            </a>
          </div>
        </div>
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={IMAGE_SRC}
            alt={co.contact19ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
