"use client";

import { useState } from "react";
import {
  IconBrandDocker,
  IconBrandFigma,
  IconBrandGraphql,
  IconBrandNodejs,
  IconBrandReact,
  IconBrandTypescript,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithSkillsMessages } from "@/types/pages/skills/SkillsMessages-types";

interface ToolEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  blurbKey: string;
  detailKey: string;
  levelKey: string;
  levelVariant: BadgeVariant;
}

const TOOLS: ToolEntry[] = [
  {
    id: "tool-1",
    icon: IconBrandReact,
    nameKey: "skills1Tool1Name",
    blurbKey: "skills1Tool1Blurb",
    detailKey: "skills1Tool1Detail",
    levelKey: "skills1LevelExpert",
    levelVariant: "success",
  },
  {
    id: "tool-2",
    icon: IconBrandTypescript,
    nameKey: "skills1Tool2Name",
    blurbKey: "skills1Tool2Blurb",
    detailKey: "skills1Tool2Detail",
    levelKey: "skills1LevelExpert",
    levelVariant: "success",
  },
  {
    id: "tool-3",
    icon: IconBrandNodejs,
    nameKey: "skills1Tool3Name",
    blurbKey: "skills1Tool3Blurb",
    detailKey: "skills1Tool3Detail",
    levelKey: "skills1LevelAdvanced",
    levelVariant: "info",
  },
  {
    id: "tool-4",
    icon: IconBrandGraphql,
    nameKey: "skills1Tool4Name",
    blurbKey: "skills1Tool4Blurb",
    detailKey: "skills1Tool4Detail",
    levelKey: "skills1LevelAdvanced",
    levelVariant: "info",
  },
  {
    id: "tool-5",
    icon: IconBrandDocker,
    nameKey: "skills1Tool5Name",
    blurbKey: "skills1Tool5Blurb",
    detailKey: "skills1Tool5Detail",
    levelKey: "skills1LevelProficient",
    levelVariant: "soft",
  },
  {
    id: "tool-6",
    icon: IconBrandFigma,
    nameKey: "skills1Tool6Name",
    blurbKey: "skills1Tool6Blurb",
    detailKey: "skills1Tool6Detail",
    levelKey: "skills1LevelFamiliar",
    levelVariant: "outline",
  },
];

export function StickyToolSpotlightSkills() {
  const t = useMessages("pages") as unknown as PagesWithSkillsMessages;
  const sk = t.skills;
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = TOOLS.find((tool) => tool.id === activeId) ?? null;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {sk.skills1Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {sk.skills1Heading}
            </h2>
            <p className="text-muted leading-relaxed">{sk.skills1Intro}</p>
            <div className="border-border bg-surface rounded-xl border p-5">
              {active ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="border-border bg-bg flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <active.icon
                        size={20}
                        aria-hidden="true"
                        className="text-fg"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-muted text-xs">
                        {sk.skills1SpotlightEyebrow}
                      </p>
                      <p className="text-fg truncate text-sm font-semibold">
                        {sk[active.nameKey]}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    {sk[active.detailKey]}
                  </p>
                </div>
              ) : (
                <p className="text-muted text-sm leading-relaxed">
                  {sk.skills1SelectPrompt}
                </p>
              )}
            </div>
          </div>
          <ul
            className="border-border divide-border divide-y lg:col-span-3"
            aria-label={sk.skills1ListAria}
          >
            {TOOLS.map((tool) => {
              const isActive = tool.id === activeId;
              return (
                <li key={tool.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveId(isActive ? null : tool.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-lg px-3 py-4 text-left transition-colors",
                      isActive
                        ? "bg-surface-hover ring-brand ring-2"
                        : "hover:bg-surface-hover",
                    )}
                  >
                    <span className="border-border bg-surface flex size-11 shrink-0 items-center justify-center rounded-lg border">
                      <tool.icon
                        size={22}
                        aria-hidden="true"
                        className="text-fg"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-fg block text-sm font-semibold">
                        {sk[tool.nameKey]}
                      </span>
                      <span className="text-muted block text-sm">
                        {sk[tool.blurbKey]}
                      </span>
                    </span>
                    <Badge
                      variant={tool.levelVariant}
                      size="sm"
                      className="shrink-0"
                    >
                      {sk[tool.levelKey]}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
