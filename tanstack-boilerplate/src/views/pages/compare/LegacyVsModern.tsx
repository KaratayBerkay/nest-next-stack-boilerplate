"use client";

import {
  IconBolt,
  IconCloud,
  IconCoin,
  IconGauge,
  IconLayersIntersect,
  IconShieldCheck,
  IconSparkles,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

const LEGACY_KEYS = [
  "compare10Legacy1",
  "compare10Legacy2",
  "compare10Legacy3",
  "compare10Legacy4",
  "compare10Legacy5",
  "compare10Legacy6",
  "compare10Legacy7",
  "compare10Legacy8",
] as const;

const NEW_ITEMS: { icon: ReactNode; textKey: string }[] = [
  { icon: <IconSparkles size={18} stroke={2} />, textKey: "compare10New1" },
  {
    icon: <IconLayersIntersect size={18} stroke={2} />,
    textKey: "compare10New2",
  },
  { icon: <IconBolt size={18} stroke={2} />, textKey: "compare10New3" },
  { icon: <IconShieldCheck size={18} stroke={2} />, textKey: "compare10New4" },
  { icon: <IconCloud size={18} stroke={2} />, textKey: "compare10New5" },
  { icon: <IconCoin size={18} stroke={2} />, textKey: "compare10New6" },
  { icon: <IconGauge size={18} stroke={2} />, textKey: "compare10New7" },
  { icon: <IconWand size={18} stroke={2} />, textKey: "compare10New8" },
];

const LEGACY_PANEL_CLASSES =
  "bg-surface-hover/50 divide-y divide-border rounded-2xl lg:rounded-r-none";

const NEW_PANEL_CLASSES =
  "border-border divide-y divide-border rounded-2xl border lg:rounded-l-none";

export function LegacyVsModern() {
  const m = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = m.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co.compare10Eyebrow}
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compare10Heading}{" "}
            <span className="text-muted">{co.compare10HeadingMuted}</span>
          </h2>
          <p className="text-muted text-lg">{co.compare10Description}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-0">
          <div className={LEGACY_PANEL_CLASSES}>
            <div className="px-6 py-5 lg:px-8">
              <h3 className="text-lg font-semibold">
                {co.compare10LegacyTitle}
              </h3>
            </div>
            <ul className="divide-border divide-y">
              {LEGACY_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-3 px-6 py-4 lg:px-8"
                >
                  <IconX
                    size={16}
                    stroke={2}
                    className="text-muted mt-0.5 shrink-0"
                  />
                  <span className="text-muted text-sm">{co[key]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={NEW_PANEL_CLASSES}>
            <div className="px-6 py-5 lg:px-8">
              <h3 className="text-lg font-semibold">{co.compare10NewTitle}</h3>
            </div>
            <ul className="divide-border divide-y">
              {NEW_ITEMS.map((item) => (
                <li
                  key={item.textKey}
                  className="flex items-start gap-3 px-6 py-4 lg:px-8"
                >
                  <span className="bg-brand/10 text-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {item.icon}
                  </span>
                  <span className="text-sm">{co[item.textKey]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
