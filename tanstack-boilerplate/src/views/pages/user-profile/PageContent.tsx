"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HeroBannerStatsHeaderUserProfile } from "./HeroBannerStatsHeaderUserProfile";
import { SidebarCardActivityFeedUserProfile } from "./SidebarCardActivityFeedUserProfile";
import { TabbedPostsAboutBadgesUserProfile } from "./TabbedPostsAboutBadgesUserProfile";
import { CompactSummaryCardUserProfile } from "./CompactSummaryCardUserProfile";
import { SkillsBadgesShowcaseUserProfile } from "./SkillsBadgesShowcaseUserProfile";
import { SocialProofFollowRowUserProfile } from "./SocialProofFollowRowUserProfile";
import { MinimalCenteredProfileUserProfile } from "./MinimalCenteredProfileUserProfile";
import { PostsGridGalleryUserProfile } from "./PostsGridGalleryUserProfile";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function UserProfilePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.userProfile;

  const examples: UIExample[] = [
    {
      id: "user-profile-1",
      title: t.userProfile1TabTitle,
      description: t.userProfile1TabDescription,
      render: () => <HeroBannerStatsHeaderUserProfile />,
    },
    {
      id: "user-profile-2",
      title: t.userProfile2TabTitle,
      description: t.userProfile2TabDescription,
      render: () => <SidebarCardActivityFeedUserProfile />,
    },
    {
      id: "user-profile-3",
      title: t.userProfile3TabTitle,
      description: t.userProfile3TabDescription,
      render: () => <TabbedPostsAboutBadgesUserProfile />,
    },
    {
      id: "user-profile-4",
      title: t.userProfile4TabTitle,
      description: t.userProfile4TabDescription,
      render: () => <CompactSummaryCardUserProfile />,
    },
    {
      id: "user-profile-5",
      title: t.userProfile5TabTitle,
      description: t.userProfile5TabDescription,
      render: () => <SkillsBadgesShowcaseUserProfile />,
    },
    {
      id: "user-profile-6",
      title: t.userProfile6TabTitle,
      description: t.userProfile6TabDescription,
      render: () => <SocialProofFollowRowUserProfile />,
    },
    {
      id: "user-profile-7",
      title: t.userProfile7TabTitle,
      description: t.userProfile7TabDescription,
      render: () => <MinimalCenteredProfileUserProfile />,
    },
    {
      id: "user-profile-8",
      title: t.userProfile8TabTitle,
      description: t.userProfile8TabDescription,
      render: () => <PostsGridGalleryUserProfile />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.userProfileTitle}
      intro={m.examples.userProfileDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="user-profile"
    />
  );
}
