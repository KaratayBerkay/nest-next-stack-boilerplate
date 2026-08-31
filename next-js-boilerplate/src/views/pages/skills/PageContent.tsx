"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StickyToolSpotlightSkills } from "./StickyToolSpotlightSkills";
import { ToolUsageGridSkills } from "./ToolUsageGridSkills";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SkillsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.skills;

  const examples: UIExample[] = [
    {
      id: "skills-1",
      title: t.skills1TabTitle,
      description: t.skills1TabDescription,
      render: () => <StickyToolSpotlightSkills />,
    },
    {
      id: "skills-2",
      title: t.skills2TabTitle,
      description: t.skills2TabDescription,
      render: () => <ToolUsageGridSkills />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.skillsTitle}
      intro={m.examples.skillsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="skills"
    />
  );
}
