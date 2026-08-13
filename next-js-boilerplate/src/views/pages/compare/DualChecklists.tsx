"use client";

import { IconBolt, IconCheck, IconMinus } from "@tabler/icons-react";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

const A_ITEMS = [
  "compare2A1",
  "compare2A2",
  "compare2A3",
  "compare2A4",
] as const;

const B_FULL_ITEMS = ["compare2B1", "compare2B2"] as const;

const B_LIMITED_ITEMS = [
  "compare2B3",
  "compare2B4",
  "compare2B5",
  "compare2B6",
] as const;

export function DualChecklists() {
  const t = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = t.compare;

  return (
    <section className="bg-surface-hover/50 w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-6xl"
          >
            {co.compare2Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {co.compare2Intro}
          </Typography>
        </div>
        <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <article className="border-border bg-surface flex flex-col rounded-2xl border p-6">
            <div className="flex items-center gap-3">
              <span className="bg-brand/10 border-brand/30 flex size-10 items-center justify-center rounded-xl border">
                <IconBolt size={20} className="text-brand" />
              </span>
              <Typography variant="h5">{co.compare2AHeading}</Typography>
            </div>
            <Separator className="my-5" />
            <ul className="flex flex-col gap-3.5">
              {A_ITEMS.map((itemKey) => (
                <li key={itemKey} className="flex items-start gap-2.5">
                  <IconCheck size={18} className="text-brand mt-0.5 shrink-0" />
                  <Typography variant="body">{co[itemKey]}</Typography>
                </li>
              ))}
            </ul>
          </article>
          <article className="border-border bg-surface flex flex-col rounded-2xl border p-6">
            <div className="flex items-center gap-3">
              <span className="bg-surface-hover border-border flex size-10 items-center justify-center rounded-xl border">
                <IconBolt size={20} className="text-muted" />
              </span>
              <Typography variant="h5">{co.compare2BHeading}</Typography>
            </div>
            <Separator className="my-5" />
            <ul className="flex flex-col gap-3.5">
              {B_FULL_ITEMS.map((itemKey) => (
                <li key={itemKey} className="flex items-start gap-2.5">
                  <IconCheck size={18} className="text-brand mt-0.5 shrink-0" />
                  <Typography variant="body">{co[itemKey]}</Typography>
                </li>
              ))}
              {B_LIMITED_ITEMS.map((itemKey) => (
                <li key={itemKey} className="flex items-start gap-2.5">
                  <IconMinus size={18} className="text-muted mt-0.5 shrink-0" />
                  <Typography
                    variant="body"
                    className="text-muted line-through"
                  >
                    {co[itemKey]}
                  </Typography>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Typography
              variant="h3"
              className="text-3xl font-medium tracking-tight"
            >
              {co.compare2Sub1Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.compare2Sub1Body}
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            <Typography
              variant="h3"
              className="text-3xl font-medium tracking-tight"
            >
              {co.compare2Sub2Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.compare2Sub2Body}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
