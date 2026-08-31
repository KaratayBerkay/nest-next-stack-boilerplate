"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredInvite } from "./CenteredInvite";
import { CommunityLinkGrid } from "./CommunityLinkGrid";
import { PlatformCards } from "./PlatformCards";
import { GradientSocialTiles } from "./GradientSocialTiles";
import { GitHubSpotlight } from "./GitHubSpotlight";
import { CommunityIconGrid } from "./CommunityIconGrid";
import { SocialChannels } from "./SocialChannels";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CommunityPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.community;

  const examples: UIExample[] = [
    {
      id: "community-1",
      title: t.community1TabTitle,
      description: t.community1TabDescription,
      render: () => <CenteredInvite />,
    },
    {
      id: "community-2",
      title: t.community2TabTitle,
      description: t.community2TabDescription,
      render: () => <CommunityLinkGrid />,
    },
    {
      id: "community-3",
      title: t.community3TabTitle,
      description: t.community3TabDescription,
      render: () => <PlatformCards />,
    },
    {
      id: "community-4",
      title: t.community4TabTitle,
      description: t.community4TabDescription,
      render: () => <GradientSocialTiles />,
    },
    {
      id: "community-5",
      title: t.community5TabTitle,
      description: t.community5TabDescription,
      render: () => <GitHubSpotlight />,
    },
    {
      id: "community-6",
      title: t.community6TabTitle,
      description: t.community6TabDescription,
      render: () => <CommunityIconGrid />,
    },
    {
      id: "community-7",
      title: t.community7TabTitle,
      description: t.community7TabDescription,
      render: () => <SocialChannels />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.communityTitle}
      intro={m.examples.communityDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="community"
    />
  );
}
