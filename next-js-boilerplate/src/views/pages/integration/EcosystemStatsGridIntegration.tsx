"use client";

import {
  IconApps,
  IconBolt,
  IconCloud,
  IconCube,
  IconDatabase,
  IconHexagon,
  IconLayoutGrid,
  IconLink,
  IconPuzzle,
  IconStack2,
  IconTopologyStar3,
  IconWebhook,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

interface StatEntry {
  id: string;
  valueKey: string;
  labelKey: string;
}

const STATS: StatEntry[] = [
  {
    id: "stat-1",
    valueKey: "integration5Stat1Value",
    labelKey: "integration5Stat1Label",
  },
  {
    id: "stat-2",
    valueKey: "integration5Stat2Value",
    labelKey: "integration5Stat2Label",
  },
  {
    id: "stat-3",
    valueKey: "integration5Stat3Value",
    labelKey: "integration5Stat3Label",
  },
  {
    id: "stat-4",
    valueKey: "integration5Stat4Value",
    labelKey: "integration5Stat4Label",
  },
];

interface GridTool {
  id: string;
  icon: Icon;
  nameKey: string;
}

const GRID_TOOLS: GridTool[] = [
  { id: "grid-1", icon: IconApps, nameKey: "integration5Tool1Name" },
  { id: "grid-2", icon: IconPuzzle, nameKey: "integration5Tool2Name" },
  { id: "grid-3", icon: IconWebhook, nameKey: "integration5Tool3Name" },
  { id: "grid-4", icon: IconLink, nameKey: "integration5Tool4Name" },
  { id: "grid-5", icon: IconCube, nameKey: "integration5Tool5Name" },
  { id: "grid-6", icon: IconHexagon, nameKey: "integration5Tool6Name" },
  { id: "grid-7", icon: IconStack2, nameKey: "integration5Tool7Name" },
  { id: "grid-8", icon: IconDatabase, nameKey: "integration5Tool8Name" },
  { id: "grid-9", icon: IconCloud, nameKey: "integration5Tool9Name" },
  { id: "grid-10", icon: IconBolt, nameKey: "integration5Tool10Name" },
  { id: "grid-11", icon: IconLayoutGrid, nameKey: "integration5Tool11Name" },
  { id: "grid-12", icon: IconTopologyStar3, nameKey: "integration5Tool12Name" },
];

export function EcosystemStatsGridIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-start lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {ig.integration5Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {ig.integration5Heading}
            </h2>
            <p className="text-muted leading-relaxed">{ig.integration5Intro}</p>
            <dl className="mt-2 grid grid-cols-2 gap-5">
              {STATS.map((stat) => (
                <div key={stat.id} className="flex flex-col gap-0.5">
                  <dt className="text-fg text-2xl font-bold tracking-tight">
                    {ig[stat.valueKey]}
                  </dt>
                  <dd className="text-muted text-xs">{ig[stat.labelKey]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ul
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:col-span-3"
            aria-label={ig.integration5GridAria}
          >
            {GRID_TOOLS.map((tool) => (
              <li key={tool.id}>
                <div className="border-border bg-surface hover:bg-surface-hover flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors">
                  <tool.icon size={22} aria-hidden="true" className="text-fg" />
                  <span className="text-fg text-xs font-medium">
                    {ig[tool.nameKey]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
