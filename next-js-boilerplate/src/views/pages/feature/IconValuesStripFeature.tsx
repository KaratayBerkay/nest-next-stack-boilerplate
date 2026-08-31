"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconBolt,
  IconHeartHandshake,
  IconLock,
  IconScale,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface ValueItem {
  id: string;
  icon: Icon;
  labelKey: string;
}

const VALUES: ValueItem[] = [
  { id: "speed", icon: IconBolt, labelKey: "feature170Value1" },
  { id: "trust", icon: IconHeartHandshake, labelKey: "feature170Value2" },
  { id: "privacy", icon: IconLock, labelKey: "feature170Value3" },
  { id: "fairness", icon: IconScale, labelKey: "feature170Value4" },
];

export function IconValuesStripFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-8 rounded-2xl border p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {VALUES.map((value) => (
              <div key={value.id} className="flex items-center gap-2.5">
                <value.icon
                  size={18}
                  className="text-brand"
                  aria-hidden="true"
                />
                <span className="text-fg text-sm font-medium">
                  {f[value.labelKey]}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="#"
            className="text-brand inline-flex shrink-0 items-center gap-1.5 text-sm font-medium hover:underline"
          >
            {f.feature170Link}
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
