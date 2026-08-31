"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StickyRailChangelog } from "./StickyRailChangelog";
import { HeroTimelineChangelog } from "./HeroTimelineChangelog";
import { CategoryDotsGridChangelog } from "./CategoryDotsGridChangelog";
import { SocialFeedChangelog } from "./SocialFeedChangelog";
import { AuthorTabsChangelog } from "./AuthorTabsChangelog";
import { ReleaseOverlayChangelog } from "./ReleaseOverlayChangelog";
import { OnThisPageChangelog } from "./OnThisPageChangelog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ChangelogPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.changelog;

  const examples: UIExample[] = [
    {
      id: "changelog-1",
      title: t.changelog1TabTitle,
      description: t.changelog1TabDescription,
      render: () => <StickyRailChangelog />,
    },
    {
      id: "changelog-2",
      title: t.changelog2TabTitle,
      description: t.changelog2TabDescription,
      render: () => <HeroTimelineChangelog />,
    },
    {
      id: "changelog-3",
      title: t.changelog3TabTitle,
      description: t.changelog3TabDescription,
      render: () => <CategoryDotsGridChangelog />,
    },
    {
      id: "changelog-4",
      title: t.changelog4TabTitle,
      description: t.changelog4TabDescription,
      render: () => <SocialFeedChangelog />,
    },
    {
      id: "changelog-5",
      title: t.changelog5TabTitle,
      description: t.changelog5TabDescription,
      render: () => <AuthorTabsChangelog />,
    },
    {
      id: "changelog-6",
      title: t.changelog6TabTitle,
      description: t.changelog6TabDescription,
      render: () => <ReleaseOverlayChangelog />,
    },
    {
      id: "changelog-8",
      title: t.changelog8TabTitle,
      description: t.changelog8TabDescription,
      render: () => <OnThisPageChangelog />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.changelogTitle}
      intro={m.examples.changelogDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="changelog"
    />
  );
}
