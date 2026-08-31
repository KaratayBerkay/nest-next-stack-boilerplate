"use client";

import { IconCheck, IconCompass, IconScale, IconTarget } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface Pillar {
  id: string;
  icon: Icon;
  titleKey: string;
  checkKeys: readonly [string, string, string];
}

const PILLARS: Pillar[] = [
  {
    id: "focus",
    icon: IconTarget,
    titleKey: "feature229Pillar1Title",
    checkKeys: [
      "feature229Pillar1Check1",
      "feature229Pillar1Check2",
      "feature229Pillar1Check3",
    ],
  },
  {
    id: "balance",
    icon: IconScale,
    titleKey: "feature229Pillar2Title",
    checkKeys: [
      "feature229Pillar2Check1",
      "feature229Pillar2Check2",
      "feature229Pillar2Check3",
    ],
  },
  {
    id: "direction",
    icon: IconCompass,
    titleKey: "feature229Pillar3Title",
    checkKeys: [
      "feature229Pillar3Check1",
      "feature229Pillar3Check2",
      "feature229Pillar3Check3",
    ],
  },
];

export function PillarChecklistTrioFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature229Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature229Intro}</p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="flex flex-col items-start gap-4">
              <span className="bg-brand/10 text-brand flex size-12 shrink-0 items-center justify-center rounded-full">
                <pillar.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-lg font-semibold">
                {f[pillar.titleKey]}
              </h3>
              <ul className="border-border flex w-full flex-col gap-2.5 border-t pt-4">
                {pillar.checkKeys.map((checkKey) => (
                  <li key={checkKey} className="flex items-center gap-2.5">
                    <IconCheck
                      size={16}
                      className="text-brand shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted text-sm">{f[checkKey]}</span>
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
