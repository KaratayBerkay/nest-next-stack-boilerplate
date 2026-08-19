"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Badge } from "@/components/ui/Badge";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_ITEMS = [
  { qKey: "faq5Q1", aKey: "faq5A1" },
  { qKey: "faq5Q2", aKey: "faq5A2" },
  { qKey: "faq5Q3", aKey: "faq5A3" },
  { qKey: "faq5Q4", aKey: "faq5A4" },
  { qKey: "faq5Q5", aKey: "faq5A5" },
] as const;

export function NumberedListFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start gap-4">
          <Badge>{f.faq5Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq5Heading}
          </h2>
          <p className="text-muted">{f.faq5Intro}</p>
        </div>
        <ol className="flex flex-col gap-8">
          {FAQ_ITEMS.map((item, index) => (
            <li key={item.qKey} className="flex items-baseline gap-4">
              <span className="text-brand text-sm font-semibold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-base font-semibold">
                  {f[item.qKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[item.aKey]}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
