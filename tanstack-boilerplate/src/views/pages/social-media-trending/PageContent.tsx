"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { VideoClipCarouselSocialMediaTrending } from "./VideoClipCarouselSocialMediaTrending";
import { PostGridSocialMediaTrending } from "./PostGridSocialMediaTrending";
import { MasonryFeedSocialMediaTrending } from "./MasonryFeedSocialMediaTrending";
import { PlatformTabsSocialMediaTrending } from "./PlatformTabsSocialMediaTrending";
import { HashtagCloudSocialMediaTrending } from "./HashtagCloudSocialMediaTrending";
import { FeaturedPostListSocialMediaTrending } from "./FeaturedPostListSocialMediaTrending";
import { TrendingTickerSocialMediaTrending } from "./TrendingTickerSocialMediaTrending";
import { EngagementStatsSocialMediaTrending } from "./EngagementStatsSocialMediaTrending";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

export default function SocialMediaTrendingPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithSocialMediaTrendingMessages & {
    examples: {
      socialMediaTrendingTitle: string;
      socialMediaTrendingDescription: string;
    };
  };
  const t = m.socialMediaTrending;

  const examples: UIExample[] = [
    {
      id: "social-media-trending-1",
      title: t.socialMediaTrending1TabTitle,
      description: t.socialMediaTrending1TabDescription,
      render: () => <VideoClipCarouselSocialMediaTrending />,
    },
    {
      id: "social-media-trending-2",
      title: t.socialMediaTrending2TabTitle,
      description: t.socialMediaTrending2TabDescription,
      render: () => <PostGridSocialMediaTrending />,
    },
    {
      id: "social-media-trending-3",
      title: t.socialMediaTrending3TabTitle,
      description: t.socialMediaTrending3TabDescription,
      render: () => <MasonryFeedSocialMediaTrending />,
    },
    {
      id: "social-media-trending-4",
      title: t.socialMediaTrending4TabTitle,
      description: t.socialMediaTrending4TabDescription,
      render: () => <PlatformTabsSocialMediaTrending />,
    },
    {
      id: "social-media-trending-5",
      title: t.socialMediaTrending5TabTitle,
      description: t.socialMediaTrending5TabDescription,
      render: () => <HashtagCloudSocialMediaTrending />,
    },
    {
      id: "social-media-trending-6",
      title: t.socialMediaTrending6TabTitle,
      description: t.socialMediaTrending6TabDescription,
      render: () => <FeaturedPostListSocialMediaTrending />,
    },
    {
      id: "social-media-trending-7",
      title: t.socialMediaTrending7TabTitle,
      description: t.socialMediaTrending7TabDescription,
      render: () => <TrendingTickerSocialMediaTrending />,
    },
    {
      id: "social-media-trending-8",
      title: t.socialMediaTrending8TabTitle,
      description: t.socialMediaTrending8TabDescription,
      render: () => <EngagementStatsSocialMediaTrending />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.socialMediaTrendingTitle}
      intro={m.examples.socialMediaTrendingDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="social-media-trending"
    />
  );
}
