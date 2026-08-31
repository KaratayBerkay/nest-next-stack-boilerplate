"use client";

import { useMemo, useState } from "react";
import {
  IconBrandAws,
  IconBrandGit,
  IconBrandMongodb,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandTailwind,
  IconBrandVite,
  IconBrandVscode,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithSkillsMessages } from "@/types/pages/skills/SkillsMessages-types";

type Frequency = "daily" | "weekly" | "occasional";
type FrequencyFilter = "all" | Frequency;

interface UsageEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  noteKey: string;
  frequency: Frequency;
  frequencyKey: string;
  frequencyVariant: BadgeVariant;
  value: number;
}

const TOOLS: UsageEntry[] = [
  {
    id: "usage-1",
    icon: IconBrandTailwind,
    nameKey: "skills2Tool1Name",
    noteKey: "skills2Tool1Note",
    frequency: "daily",
    frequencyKey: "skills2FrequencyDaily",
    frequencyVariant: "success",
    value: 92,
  },
  {
    id: "usage-2",
    icon: IconBrandGit,
    nameKey: "skills2Tool2Name",
    noteKey: "skills2Tool2Note",
    frequency: "daily",
    frequencyKey: "skills2FrequencyDaily",
    frequencyVariant: "success",
    value: 88,
  },
  {
    id: "usage-3",
    icon: IconBrandVscode,
    nameKey: "skills2Tool3Name",
    noteKey: "skills2Tool3Note",
    frequency: "daily",
    frequencyKey: "skills2FrequencyDaily",
    frequencyVariant: "success",
    value: 95,
  },
  {
    id: "usage-4",
    icon: IconBrandNotion,
    nameKey: "skills2Tool4Name",
    noteKey: "skills2Tool4Note",
    frequency: "weekly",
    frequencyKey: "skills2FrequencyWeekly",
    frequencyVariant: "info",
    value: 61,
  },
  {
    id: "usage-5",
    icon: IconBrandSlack,
    nameKey: "skills2Tool5Name",
    noteKey: "skills2Tool5Note",
    frequency: "weekly",
    frequencyKey: "skills2FrequencyWeekly",
    frequencyVariant: "info",
    value: 54,
  },
  {
    id: "usage-6",
    icon: IconBrandVite,
    nameKey: "skills2Tool6Name",
    noteKey: "skills2Tool6Note",
    frequency: "weekly",
    frequencyKey: "skills2FrequencyWeekly",
    frequencyVariant: "info",
    value: 47,
  },
  {
    id: "usage-7",
    icon: IconBrandMongodb,
    nameKey: "skills2Tool7Name",
    noteKey: "skills2Tool7Note",
    frequency: "occasional",
    frequencyKey: "skills2FrequencyOccasional",
    frequencyVariant: "secondary",
    value: 33,
  },
  {
    id: "usage-8",
    icon: IconBrandAws,
    nameKey: "skills2Tool8Name",
    noteKey: "skills2Tool8Note",
    frequency: "occasional",
    frequencyKey: "skills2FrequencyOccasional",
    frequencyVariant: "secondary",
    value: 28,
  },
];

const FILTERS: { id: FrequencyFilter; labelKey: string }[] = [
  { id: "all", labelKey: "skills2FrequencyAll" },
  { id: "daily", labelKey: "skills2FrequencyDaily" },
  { id: "weekly", labelKey: "skills2FrequencyWeekly" },
  { id: "occasional", labelKey: "skills2FrequencyOccasional" },
];

export function ToolUsageGridSkills() {
  const t = useMessages("pages") as unknown as PagesWithSkillsMessages;
  const sk = t.skills;
  const [filter, setFilter] = useState<FrequencyFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return TOOLS;
    return TOOLS.filter((tool) => tool.frequency === filter);
  }, [filter]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.skills2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.skills2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.skills2Intro}</p>
        </div>
        <div className="mt-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as FrequencyFilter);
            }}
            aria-label={sk.skills2FilterGroupAria}
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} size="sm">
                {sk[f.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.id} variant="default">
              <div className="flex flex-col gap-4 p-4 @sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                    <item.icon
                      size={20}
                      aria-hidden="true"
                      className="text-fg"
                    />
                  </span>
                  <Badge variant={item.frequencyVariant} size="sm">
                    {sk[item.frequencyKey]}
                  </Badge>
                </div>
                <div>
                  <p className="text-fg text-sm font-semibold">
                    {sk[item.nameKey]}
                  </p>
                  <p className="text-muted mt-1 text-xs leading-relaxed">
                    {sk[item.noteKey]}
                  </p>
                </div>
                <Progress
                  value={item.value}
                  size="sm"
                  showValueLabel
                  aria-label={sk.skills2ProgressAriaTemplate.replace(
                    "{name}",
                    sk[item.nameKey],
                  )}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
