"use client";

import { useState } from "react";
import {
  IconCircleCheck,
  IconCloudUpload,
  IconCode,
  IconFlag3,
  IconRocket,
  IconServer2,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

interface DockTool {
  id: string;
  icon: Icon;
  nameKey: string;
  categoryKey: string;
  descriptionKey: string;
  feature1Key: string;
  feature2Key: string;
}

const DOCK_TOOLS: DockTool[] = [
  {
    id: "dock-1",
    icon: IconRocket,
    nameKey: "integration8Tool1Name",
    categoryKey: "integration8Tool1Category",
    descriptionKey: "integration8Tool1Description",
    feature1Key: "integration8Tool1Feature1",
    feature2Key: "integration8Tool1Feature2",
  },
  {
    id: "dock-2",
    icon: IconCloudUpload,
    nameKey: "integration8Tool2Name",
    categoryKey: "integration8Tool2Category",
    descriptionKey: "integration8Tool2Description",
    feature1Key: "integration8Tool2Feature1",
    feature2Key: "integration8Tool2Feature2",
  },
  {
    id: "dock-3",
    icon: IconServer2,
    nameKey: "integration8Tool3Name",
    categoryKey: "integration8Tool3Category",
    descriptionKey: "integration8Tool3Description",
    feature1Key: "integration8Tool3Feature1",
    feature2Key: "integration8Tool3Feature2",
  },
  {
    id: "dock-4",
    icon: IconCode,
    nameKey: "integration8Tool4Name",
    categoryKey: "integration8Tool4Category",
    descriptionKey: "integration8Tool4Description",
    feature1Key: "integration8Tool4Feature1",
    feature2Key: "integration8Tool4Feature2",
  },
  {
    id: "dock-5",
    icon: IconFlag3,
    nameKey: "integration8Tool5Name",
    categoryKey: "integration8Tool5Category",
    descriptionKey: "integration8Tool5Description",
    feature1Key: "integration8Tool5Feature1",
    feature2Key: "integration8Tool5Feature2",
  },
];

export function DockSpotlightShowcaseIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;
  const [activeId, setActiveId] = useState(DOCK_TOOLS[0].id);

  const active =
    DOCK_TOOLS.find((tool) => tool.id === activeId) ?? DOCK_TOOLS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration8Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration8Intro}</p>
        </div>

        <div className="border-border bg-surface mt-10 flex flex-col gap-6 rounded-xl border p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="border-brand bg-brand/10 text-brand flex size-14 shrink-0 items-center justify-center rounded-xl border-2">
              <active.icon size={26} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-muted text-xs font-medium">
                {ig.integration8SpotlightEyebrow}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h3 className="text-fg text-lg font-semibold">
                  {ig[active.nameKey]}
                </h3>
                <Badge variant="soft" size="sm">
                  {ig[active.categoryKey]}
                </Badge>
              </div>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                {ig[active.descriptionKey]}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                <li className="text-fg flex items-start gap-2 text-sm">
                  <IconCircleCheck
                    size={15}
                    aria-hidden="true"
                    className="text-success mt-0.5 shrink-0"
                  />
                  <span>{ig[active.feature1Key]}</span>
                </li>
                <li className="text-fg flex items-start gap-2 text-sm">
                  <IconCircleCheck
                    size={15}
                    aria-hidden="true"
                    className="text-success mt-0.5 shrink-0"
                  />
                  <span>{ig[active.feature2Key]}</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-border bg-bg flex items-center justify-center gap-3 rounded-xl border p-3"
            role="group"
            aria-label={ig.integration8DockAria}
          >
            {DOCK_TOOLS.map((tool) => {
              const isActive = tool.id === activeId;
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={ig[tool.nameKey]}
                  onClick={() => setActiveId(tool.id)}
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-lg border transition-all",
                    isActive
                      ? "border-brand bg-brand/10 text-brand scale-110 shadow-md"
                      : "border-border bg-surface text-fg hover:bg-surface-hover hover:scale-105",
                  )}
                >
                  <tool.icon size={20} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
