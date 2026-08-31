"use client";

import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature22Check1",
  "feature22Check2",
  "feature22Check3",
] as const;
const CARD_KEYS = [
  { id: "c1", titleKey: "feature22Card1Title", bodyKey: "feature22Card1Body" },
  { id: "c2", titleKey: "feature22Card2Title", bodyKey: "feature22Card2Body" },
  { id: "c3", titleKey: "feature22Card3Title", bodyKey: "feature22Card3Body" },
] as const;

export function ChecklistOutlineShowcaseFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature22Heading}
          </h2>
          <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {CHECK_KEYS.map((key) => (
              <span
                key={key}
                className="text-muted inline-flex items-center gap-1.5 text-sm"
              >
                <IconCheck
                  size={14}
                  className="text-success"
                  aria-hidden="true"
                />
                {f[key]}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {CARD_KEYS.map((card) => (
            <div
              key={card.id}
              className="border-border flex flex-col gap-2 rounded-xl border-2 p-6"
            >
              <h3 className="text-fg text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
