"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { IconGridServices } from "./IconGridServices";
import { ComparisonTableServices } from "./ComparisonTableServices";
import { ExpandableServiceAccordionServices } from "./ExpandableServiceAccordionServices";
import { HoverPreviewListServices } from "./HoverPreviewListServices";
import { DurationPricingCardsServices } from "./DurationPricingCardsServices";
import { FilterableMasonryServices } from "./FilterableMasonryServices";
import { SplitIntroImageGridServices } from "./SplitIntroImageGridServices";
import { PackageBuilderServices } from "./PackageBuilderServices";
import { LabeledRowStackServices } from "./LabeledRowStackServices";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ServicesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.services;

  const examples: UIExample[] = [
    {
      id: "services-1",
      title: t.services1TabTitle,
      description: t.services1TabDescription,
      render: () => <IconGridServices />,
    },
    {
      id: "services-2",
      title: t.services2TabTitle,
      description: t.services2TabDescription,
      render: () => <ComparisonTableServices />,
    },
    {
      id: "services-3",
      title: t.services3TabTitle,
      description: t.services3TabDescription,
      render: () => <ExpandableServiceAccordionServices />,
    },
    {
      id: "services-4",
      title: t.services4TabTitle,
      description: t.services4TabDescription,
      render: () => <HoverPreviewListServices />,
    },
    {
      id: "services-5",
      title: t.services5TabTitle,
      description: t.services5TabDescription,
      render: () => <DurationPricingCardsServices />,
    },
    {
      id: "services-6",
      title: t.services6TabTitle,
      description: t.services6TabDescription,
      render: () => <FilterableMasonryServices />,
    },
    {
      id: "services-7",
      title: t.services7TabTitle,
      description: t.services7TabDescription,
      render: () => <SplitIntroImageGridServices />,
    },
    {
      id: "services-8",
      title: t.services8TabTitle,
      description: t.services8TabDescription,
      render: () => <PackageBuilderServices />,
    },
    {
      id: "services-9",
      title: t.services9TabTitle,
      description: t.services9TabDescription,
      render: () => <LabeledRowStackServices />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.servicesTitle}
      intro={m.examples.servicesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="services"
    />
  );
}
