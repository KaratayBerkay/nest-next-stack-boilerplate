"use client";

import {
  IconBolt,
  IconChartBar,
  IconFileText,
  IconFolder,
  IconPlug,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CELL_CLASS = "border-border bg-surface rounded-lg border p-6" as const;
const ICON_BOX_CLASS =
  "bg-brand text-brand-fg mb-4 flex h-10 w-10 items-center justify-center rounded-lg" as const;

const CELLS = [
  {
    titleKey: "feature26Item1Title",
    bodyKey: "feature26Item1Body",
    Icon: IconFolder,
  },
  {
    titleKey: "feature26Item2Title",
    bodyKey: "feature26Item2Body",
    Icon: IconFileText,
  },
  {
    titleKey: "feature26Item3Title",
    bodyKey: "feature26Item3Body",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature26Item4Title",
    bodyKey: "feature26Item4Body",
    Icon: IconBolt,
  },
  {
    titleKey: "feature26Item5Title",
    bodyKey: "feature26Item5Body",
    Icon: IconPlug,
  },
  {
    titleKey: "feature26Item6Title",
    bodyKey: "feature26Item6Body",
    Icon: IconShieldCheck,
  },
] as const;

export function SixUpIconGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge>{f.feature26Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature26Heading}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CELLS.map((cell) => (
            <div key={cell.titleKey} className={CELL_CLASS}>
              <div className={ICON_BOX_CLASS}>
                <cell.Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="text-fg text-base font-semibold">
                {f[cell.titleKey]}
              </h3>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">
                {f[cell.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
