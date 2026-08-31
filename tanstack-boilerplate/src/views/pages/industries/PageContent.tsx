"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HoverRevealIndustryCards } from "./HoverRevealIndustryCards";
import { BadgeHeadingIndustryList } from "./BadgeHeadingIndustryList";
import { HoverPreviewIndustryRows } from "./HoverPreviewIndustryRows";
import { ExpandableIndustryShowcase } from "./ExpandableIndustryShowcase";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function IndustriesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.industries;

  const examples: UIExample[] = [
    {
      id: "industries-1",
      title: t.industries1TabTitle,
      description: t.industries1TabDescription,
      render: () => <HoverRevealIndustryCards />,
    },
    {
      id: "industries-2",
      title: t.industries2TabTitle,
      description: t.industries2TabDescription,
      render: () => <BadgeHeadingIndustryList />,
    },
    {
      id: "industries-3",
      title: t.industries3TabTitle,
      description: t.industries3TabDescription,
      render: () => <HoverPreviewIndustryRows />,
    },
    {
      id: "industries-4",
      title: t.industries4TabTitle,
      description: t.industries4TabDescription,
      render: () => <ExpandableIndustryShowcase />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.industriesTitle}
      intro={m.examples.industriesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="industries"
    />
  );
}
