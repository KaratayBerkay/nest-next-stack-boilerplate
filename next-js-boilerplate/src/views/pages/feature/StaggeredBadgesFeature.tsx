"use client";

import {
  IconActivity,
  IconCloudOff,
  IconFilter,
  IconKeyboard,
  IconPlug,
  IconSearch,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHIP_CLASS =
  "border-border inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm" as const;
const ICON_CLASS = "text-brand" as const;

const CHIPS = [
  {
    labelKey: "feature152Chip1Label",
    Icon: IconSearch,
    offsetClass: "lg:mt-8",
  },
  {
    labelKey: "feature152Chip2Label",
    Icon: IconFilter,
    offsetClass: "lg:-mt-4",
  },
  {
    labelKey: "feature152Chip3Label",
    Icon: IconKeyboard,
    offsetClass: "lg:mt-10",
  },
  {
    labelKey: "feature152Chip4Label",
    Icon: IconActivity,
    offsetClass: "lg:-mt-2",
  },
  {
    labelKey: "feature152Chip5Label",
    Icon: IconCloudOff,
    offsetClass: "lg:mt-6",
  },
  {
    labelKey: "feature152Chip6Label",
    Icon: IconPlug,
    offsetClass: "lg:-mt-6",
  },
] as const;

export function StaggeredBadgesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature152Heading}
          </h2>
          <p className="text-muted leading-relaxed lg:text-lg">
            {f.feature152Subline}
          </p>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {CHIPS.map((chip) => (
            <span
              key={chip.labelKey}
              className={`${CHIP_CLASS} ${chip.offsetClass}`}
            >
              <chip.Icon size={16} className={ICON_CLASS} aria-hidden="true" />
              {f[chip.labelKey]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
