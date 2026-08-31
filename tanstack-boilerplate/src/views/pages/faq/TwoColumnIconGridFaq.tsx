"use client";

import {
  IconCode,
  IconGift,
  IconPlugConnected,
  IconPlayerStop,
  IconRocket,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const FAQ_CELLS = [
  { qKey: "faq15Q1", aKey: "faq15A1", Icon: IconRocket },
  { qKey: "faq15Q2", aKey: "faq15A2", Icon: IconGift },
  { qKey: "faq15Q3", aKey: "faq15A3", Icon: IconPlayerStop },
  { qKey: "faq15Q4", aKey: "faq15A4", Icon: IconShieldCheck },
  { qKey: "faq15Q5", aKey: "faq15A5", Icon: IconPlugConnected },
  { qKey: "faq15Q6", aKey: "faq15A6", Icon: IconCode },
] as const;

export function TwoColumnIconGridFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <h2 className="text-fg mb-14 text-center text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.faq15Title}
        </h2>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {FAQ_CELLS.map((cell) => (
            <div key={cell.qKey} className="flex flex-col items-start gap-3">
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
                <cell.Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[cell.qKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[cell.aKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
