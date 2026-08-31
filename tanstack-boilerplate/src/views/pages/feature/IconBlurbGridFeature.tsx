"use client";

import {
  IconBolt,
  IconCloud,
  IconHeadset,
  IconLock,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface Blurb {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const BLURBS: Blurb[] = [
  { id: "fast", icon: IconBolt, titleKey: "feature128Item1Title", bodyKey: "feature128Item1Body" },
  { id: "secure", icon: IconLock, titleKey: "feature128Item2Title", bodyKey: "feature128Item2Body" },
  { id: "team", icon: IconUsers, titleKey: "feature128Item3Title", bodyKey: "feature128Item3Body" },
  { id: "support", icon: IconHeadset, titleKey: "feature128Item4Title", bodyKey: "feature128Item4Body" },
  { id: "cloud", icon: IconCloud, titleKey: "feature128Item5Title", bodyKey: "feature128Item5Body" },
  { id: "polish", icon: IconSparkles, titleKey: "feature128Item6Title", bodyKey: "feature128Item6Body" },
];

export function IconBlurbGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature128Heading}
        </h2>
        <p className="text-muted mt-4 leading-relaxed">{f.feature128Intro}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-x-8 gap-y-10 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {BLURBS.map((blurb) => (
          <div key={blurb.id} className="flex flex-col items-center gap-2.5 text-center">
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
              <blurb.icon size={18} aria-hidden="true" />
            </span>
            <h3 className="text-fg text-sm font-semibold">{f[blurb.titleKey]}</h3>
            <p className="text-muted text-xs leading-relaxed">{f[blurb.bodyKey]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
