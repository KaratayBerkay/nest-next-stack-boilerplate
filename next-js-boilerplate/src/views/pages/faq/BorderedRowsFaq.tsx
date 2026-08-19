"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_ITEMS = [
  { qKey: "faq2Q1", aKey: "faq2A1" },
  { qKey: "faq2Q2", aKey: "faq2A2" },
  { qKey: "faq2Q3", aKey: "faq2A3" },
  { qKey: "faq2Q4", aKey: "faq2A4" },
  { qKey: "faq2Q5", aKey: "faq2A5" },
] as const;

export function BorderedRowsFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-3">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq2Heading}
          </h2>
          <p className="text-muted">{f.faq2Intro}</p>
        </div>
        <ul className="border-border divide-border divide-y border-y">
          {FAQ_ITEMS.map((item) => (
            <li key={item.qKey} className="flex flex-col gap-2 py-6">
              <h3 className="text-fg text-base font-medium">{f[item.qKey]}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[item.aKey]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
