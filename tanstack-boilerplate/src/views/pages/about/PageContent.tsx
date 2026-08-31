"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { WithAgency } from "./WithAgency";
import { WithDevProfile } from "./WithDevProfile";
import { WithDevStory } from "./WithDevStory";
import { WithFintech } from "./WithFintech";
import { WithHero } from "./WithHero";
import { WithInteractive } from "./WithInteractive";
import { WithMission } from "./WithMission";
import { WithMissionAndDrive } from "./WithMissionAndDrive";
import { WithProductStory } from "./WithProductStory";
import { WithProfile } from "./WithProfile";
import { WithQuote } from "./WithQuote";
import { WithSixImages } from "./WithSixImages";
import { WithStaggered } from "./WithStaggered";
import { WithStats } from "./WithStats";
import { WithStory } from "./WithStory";
import { WithTeam } from "./WithTeam";
import { WithTiltedPhoto } from "./WithTiltedPhoto";
import { WithVision } from "./WithVision";
import { WithWhyUs } from "./WithWhyUs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function AboutPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
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
    {
      id: "with-mission",
      title: t.about.tabWithMissionTitle,
      description: t.about.tabWithMissionDescription,
      render: () => <WithMission />,
    },
    {
      id: "with-stats",
      title: t.about.tabWithStatsTitle,
      description: t.about.tabWithStatsDescription,
      render: () => <WithStats />,
    },
    {
      id: "with-profile",
      title: t.about.tabWithProfileTitle,
      description: t.about.tabWithProfileDescription,
      render: () => <WithProfile />,
    },
    {
      id: "with-vision",
      title: t.about.tabWithVisionTitle,
      description: t.about.tabWithVisionDescription,
      render: () => <WithVision />,
    },
    {
      id: "with-dev-story",
      title: t.about.tabWithDevStoryTitle,
      description: t.about.tabWithDevStoryDescription,
      render: () => <WithDevStory />,
    },
    {
      id: "with-product-story",
      title: t.about.tabWithProductStoryTitle,
      description: t.about.tabWithProductStoryDescription,
      render: () => <WithProductStory />,
    },
    {
      id: "with-fintech",
      title: t.about.tabWithFintechTitle,
      description: t.about.tabWithFintechDescription,
      render: () => <WithFintech />,
    },
    {
      id: "with-dev-profile",
      title: t.about.tabWithDevProfileTitle,
      description: t.about.tabWithDevProfileDescription,
      render: () => <WithDevProfile />,
    },
    {
      id: "with-agency",
      title: t.about.tabWithAgencyTitle,
      description: t.about.tabWithAgencyDescription,
      render: () => <WithAgency />,
    },
    {
      id: "with-story",
      title: t.about.tabWithStoryTitle,
      description: t.about.tabWithStoryDescription,
      render: () => <WithStory />,
    },
    {
      id: "with-hero",
      title: t.about.tabWithHeroTitle,
      description: t.about.tabWithHeroDescription,
      render: () => <WithHero />,
    },
    {
      id: "with-tilted-photo",
      title: t.about.tabWithTiltedPhotoTitle,
      description: t.about.tabWithTiltedPhotoDescription,
      render: () => <WithTiltedPhoto />,
    },
    {
      id: "with-why-us",
      title: t.about.tabWithWhyUsTitle,
      description: t.about.tabWithWhyUsDescription,
      render: () => <WithWhyUs />,
    },
    {
      id: "with-interactive",
      title: t.about.tabWithInteractiveTitle,
      description: t.about.tabWithInteractiveDescription,
      render: () => <WithInteractive />,
    },
    {
      id: "with-mission-and-drive",
      title: t.about.tabWithMissionAndDriveTitle,
      description: t.about.tabWithMissionAndDriveDescription,
      render: () => <WithMissionAndDrive />,
    },
    {
      id: "with-quote",
      title: t.about.tabWithQuoteTitle,
      description: t.about.tabWithQuoteDescription,
      render: () => <WithQuote />,
    },
    {
      id: "with-staggered",
      title: t.about.tabWithStaggeredTitle,
      description: t.about.tabWithStaggeredDescription,
      render: () => <WithStaggered />,
    },
  ];

  return (
    <TemplateBrowser
      title={t.examples.aboutTitle}
      intro={t.examples.aboutDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="about"
    />
  );
}
