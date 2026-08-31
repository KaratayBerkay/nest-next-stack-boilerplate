"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Badge } from "@/components/ui/Badge";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_ITEMS = [
  { qKey: "faq6Q1", aKey: "faq6A1" },
  { qKey: "faq6Q2", aKey: "faq6A2" },
  { qKey: "faq6Q3", aKey: "faq6A3" },
  { qKey: "faq6Q4", aKey: "faq6A4" },
] as const;

export function NumberedGridFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col items-center gap-4 text-center">
          <Badge>{f.faq6Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq6Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.faq6Intro}</p>
        </div>
        <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {FAQ_ITEMS.map((item, index) => (
            <li key={item.qKey} className="flex flex-col gap-3">
              <span className="border-border bg-surface text-muted flex size-9 items-center justify-center rounded-lg border font-mono text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-fg text-base font-medium">{f[item.qKey]}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[item.aKey]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
