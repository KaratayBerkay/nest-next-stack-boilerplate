"use client";

import {
  IconBolt,
  IconCheck,
  IconShieldCheck,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const PANELS = [
  {
    titleKey: "feature200Panel1Title",
    checkKeys: [
      "feature200Panel1Check1",
      "feature200Panel1Check2",
      "feature200Panel1Check3",
    ],
    icon: IconBolt,
    panelClass: "border-border bg-surface border",
    iconClass: "bg-bg text-fg",
  },
  {
    titleKey: "feature200Panel2Title",
    checkKeys: [
      "feature200Panel2Check1",
      "feature200Panel2Check2",
      "feature200Panel2Check3",
    ],
    icon: IconTrendingUp,
    panelClass: "bg-success/10",
    iconClass: "bg-bg text-success",
  },
  {
    titleKey: "feature200Panel3Title",
    checkKeys: [
      "feature200Panel3Check1",
      "feature200Panel3Check2",
      "feature200Panel3Check3",
    ],
    icon: IconShieldCheck,
    panelClass: "bg-brand/10",
    iconClass: "bg-bg text-brand",
  },
] as const;

export function GradientIconListFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature200Heading}
          </h2>
          <p className="text-muted">{f.feature200Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PANELS.map((panel) => (
            <div
              key={panel.titleKey}
              className={`flex flex-col gap-6 rounded-xl p-8 ${panel.panelClass}`}
            >
              <div className="flex flex-col gap-4">
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-full ${panel.iconClass}`}
                >
                  <panel.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-lg font-semibold">
                  {f[panel.titleKey]}
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {panel.checkKeys.map((checkKey) => (
                  <li key={checkKey} className="flex items-start gap-2.5">
                    <IconCheck
                      size={18}
                      className="text-fg mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted text-sm leading-relaxed">
                      {f[checkKey]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
