"use client";

import { IconChartBar, IconCloud, IconLock, IconUsers } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface Column {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const COLUMNS: Column[] = [
  { id: "insights", icon: IconChartBar, titleKey: "feature10Col1Title", bodyKey: "feature10Col1Body" },
  { id: "cloud", icon: IconCloud, titleKey: "feature10Col2Title", bodyKey: "feature10Col2Body" },
  { id: "security", icon: IconLock, titleKey: "feature10Col3Title", bodyKey: "feature10Col3Body" },
  { id: "team", icon: IconUsers, titleKey: "feature10Col4Title", bodyKey: "feature10Col4Body" },
];

export function DashedIconColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature10Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature10Intro}</p>
        </div>
        <div className="mt-12 grid divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0 [&>*]:border-dashed [&>*]:border-border">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col items-start gap-3 border-t px-6 py-6 first:border-t-0 sm:border-t-0 sm:first:pl-0 sm:last:pr-0">
              <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                <column.icon size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-sm font-semibold">
                {f[column.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[column.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
