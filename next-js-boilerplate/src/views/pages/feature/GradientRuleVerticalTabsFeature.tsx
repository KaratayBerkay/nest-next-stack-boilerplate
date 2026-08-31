"use client";

import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS = [
  {
    id: "plan",
    labelKey: "feature167Tab1Label",
    bodyKey: "feature167Tab1Body",
  },
  {
    id: "track",
    labelKey: "feature167Tab2Label",
    bodyKey: "feature167Tab2Body",
  },
  {
    id: "report",
    labelKey: "feature167Tab3Label",
    bodyKey: "feature167Tab3Body",
  },
  {
    id: "automate",
    labelKey: "feature167Tab4Label",
    bodyKey: "feature167Tab4Body",
  },
] as const;

export function GradientRuleVerticalTabsFeature() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="flex flex-col">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                data-state={tab.id === activeId ? "active" : "inactive"}
                className="from-brand to-info data-[state=active]:text-fg data-[state=inactive]:text-muted data-[state=inactive]:hover:text-fg relative py-3.5 pl-5 text-left text-sm font-medium transition-colors data-[state=active]:bg-gradient-to-b data-[state=active]:bg-[length:2px_100%] data-[state=active]:bg-left data-[state=active]:bg-no-repeat"
              >
                {f[tab.labelKey]}
              </button>
            ))}
          </div>
          <div className="border-border bg-surface rounded-xl border p-8">
            <p className="text-muted leading-relaxed">{f[active.bodyKey]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
