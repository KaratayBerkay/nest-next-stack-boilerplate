"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MetricsSidebarCaseStudy } from "./MetricsSidebarCaseStudy";
import { SectionNavAvatarsCaseStudy } from "./SectionNavAvatarsCaseStudy";
import { ArticleCompanySidebarCaseStudy } from "./ArticleCompanySidebarCaseStudy";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CaseStudyPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.caseStudy;

  const examples: UIExample[] = [
    {
      id: "case-study-1",
      title: t.caseStudy1TabTitle,
      description: t.caseStudy1TabDescription,
      render: () => <MetricsSidebarCaseStudy />,
    },
    {
      id: "case-study-3",
      title: t.caseStudy3TabTitle,
      description: t.caseStudy3TabDescription,
      render: () => <SectionNavAvatarsCaseStudy />,
    },
    {
      id: "case-study-8",
      title: t.caseStudy8TabTitle,
      description: t.caseStudy8TabDescription,
      render: () => <ArticleCompanySidebarCaseStudy />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.caseStudyTitle}
      intro={m.examples.caseStudyDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="case-study"
    />
  );
}
