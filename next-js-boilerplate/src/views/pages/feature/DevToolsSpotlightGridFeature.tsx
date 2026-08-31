"use client";

import { IconBook, IconCode, IconTerminal2 } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TOOLS: {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
  spotlight?: boolean;
}[] = [
  {
    id: "cli",
    icon: IconTerminal2,
    titleKey: "feature256Card1Title",
    bodyKey: "feature256Card1Body",
    spotlight: true,
  },
  {
    id: "sdk",
    icon: IconCode,
    titleKey: "feature256Card2Title",
    bodyKey: "feature256Card2Body",
  },
  {
    id: "docs",
    icon: IconBook,
    titleKey: "feature256Card3Title",
    bodyKey: "feature256Card3Body",
  },
];

export function DevToolsSpotlightGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature256Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature256Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className={`flex flex-col gap-4 rounded-xl border p-6 ${tool.spotlight ? "border-brand bg-brand/5" : "border-border bg-surface"}`}
            >
              <div className="flex items-center justify-between">
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <tool.icon size={18} aria-hidden="true" />
                </span>
                {tool.spotlight ? (
                  <Badge>{f.feature256SpotlightBadge}</Badge>
                ) : null}
              </div>
              <h3 className="text-fg text-base font-semibold">
                {f[tool.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[tool.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
