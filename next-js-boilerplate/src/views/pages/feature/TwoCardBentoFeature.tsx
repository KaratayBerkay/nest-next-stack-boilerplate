"use client";

import {
  IconArrowRight,
  IconChartBar,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function TwoCardBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-8">
            <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-lg">
              <IconChartBar size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-lg font-semibold">
              {f.feature5Card1Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature5Card1Body}
            </p>
            <span className="text-brand mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
              {f.feature5Card1Link}
              <IconArrowRight size={14} aria-hidden="true" />
            </span>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-8">
            <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-lg">
              <IconShieldCheck size={20} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-lg font-semibold">
              {f.feature5Card2Title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature5Card2Body}
            </p>
            <span className="text-brand mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
              {f.feature5Card2Link}
              <IconArrowRight size={14} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
