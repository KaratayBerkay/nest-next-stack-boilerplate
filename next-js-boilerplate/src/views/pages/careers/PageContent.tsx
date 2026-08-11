"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { DepartmentGroupedList } from "./DepartmentGroupedList";
import { DashedFrameOpenings } from "./DashedFrameOpenings";
import { CategoryBadgeOpenings } from "./CategoryBadgeOpenings";
import { CategorySectionsHeading } from "./CategorySectionsHeading";
import { CenteredFullWidthStack } from "./CenteredFullWidthStack";
import { StatsHeaderJobCards } from "./StatsHeaderJobCards";
import { GroupedRowActions } from "./GroupedRowActions";
import { FilterableDepCardGrid } from "./FilterableDepCardGrid";
import { GradientGeneralApplication } from "./GradientGeneralApplication";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CareersPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.careers;

  const examples: UIExample[] = [
    {
      id: "careers-1",
      title: t.careers1TabTitle,
      description: t.careers1TabDescription,
      render: () => <DepartmentGroupedList />,
    },
    {
      id: "careers-2",
      title: t.careers2TabTitle,
      description: t.careers2TabDescription,
      render: () => <DashedFrameOpenings />,
    },
    {
      id: "careers-3",
      title: t.careers3TabTitle,
      description: t.careers3TabDescription,
      render: () => <CategoryBadgeOpenings />,
    },
    {
      id: "careers-4",
      title: t.careers4TabTitle,
      description: t.careers4TabDescription,
      render: () => <CategorySectionsHeading />,
    },
    {
      id: "careers-5",
      title: t.careers5TabTitle,
      description: t.careers5TabDescription,
      render: () => <CenteredFullWidthStack />,
    },
    {
      id: "careers-6",
      title: t.careers6TabTitle,
      description: t.careers6TabDescription,
      render: () => <StatsHeaderJobCards />,
    },
    {
      id: "careers-7",
      title: t.careers7TabTitle,
      description: t.careers7TabDescription,
      render: () => <GroupedRowActions />,
    },
    {
      id: "careers-8",
      title: t.careers8TabTitle,
      description: t.careers8TabDescription,
      render: () => <FilterableDepCardGrid />,
    },
    {
      id: "careers-9",
      title: t.careers9TabTitle,
      description: t.careers9TabDescription,
      render: () => <GradientGeneralApplication />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.careersTitle}
      intro={m.examples.careersDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
