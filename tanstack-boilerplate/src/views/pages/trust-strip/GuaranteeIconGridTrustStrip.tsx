"use client";

import {
  IconHeadset,
  IconMoneybag,
  IconRotate,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTrustStripMessages } from "@/types/pages/trust-strip/TrustStripMessages-types";

const GUARANTEES = [
  {
    id: "secure",
    icon: IconShieldCheck,
    titleKey: "trustStrip1Guarantee1Title",
    descKey: "trustStrip1Guarantee1Desc",
  },
  {
    id: "returns",
    icon: IconRotate,
    titleKey: "trustStrip1Guarantee2Title",
    descKey: "trustStrip1Guarantee2Desc",
  },
  {
    id: "support",
    icon: IconHeadset,
    titleKey: "trustStrip1Guarantee3Title",
    descKey: "trustStrip1Guarantee3Desc",
  },
  {
    id: "refund",
    icon: IconMoneybag,
    titleKey: "trustStrip1Guarantee4Title",
    descKey: "trustStrip1Guarantee4Desc",
  },
] as const;

export function GuaranteeIconGridTrustStrip() {
  const t = useMessages("pages") as unknown as PagesWithTrustStripMessages;
  const ts = t.trustStrip;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-muted text-xs font-semibold tracking-[0.2em] uppercase">
            {ts.trustStrip1Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight md:text-3xl">
            {ts.trustStrip1Heading}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <div
              key={item.id}
              className="border-border bg-surface flex flex-col items-center gap-3 rounded-2xl border p-6 text-center"
            >
              <span className="border-border bg-bg flex size-12 shrink-0 items-center justify-center rounded-full border shadow-xs">
                <item.icon size={22} aria-hidden="true" className="text-brand" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-fg text-sm font-medium">
                  {ts[item.titleKey]}
                </span>
                <span className="text-muted text-xs leading-relaxed">
                  {ts[item.descKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
