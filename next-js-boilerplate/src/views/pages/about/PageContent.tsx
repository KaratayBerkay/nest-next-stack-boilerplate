"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { WithSixImages } from "./WithSixImages";
import { WithTeam } from "./WithTeam";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function AboutPageContent({ initialTab }: InitialTabProps) {
  const t = useMessages("pages");

  const examples: UIExample[] = [
    {
      id: "with-6-image",
      title: t.about.tabWithSixImagesTitle,
      description: t.about.tabWithSixImagesDescription,
      render: () => <WithSixImages />,
    },
    {
      id: "with-team",
      title: t.about.tabWithTeamTitle,
      description: t.about.tabWithTeamDescription,
      render: () => <WithTeam />,
    },
  ];

  return (
    <ExampleTabs
      title={t.examples.aboutTitle}
      intro={t.examples.aboutDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
