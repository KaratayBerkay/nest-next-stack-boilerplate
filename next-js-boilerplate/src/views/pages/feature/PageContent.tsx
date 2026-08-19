"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import { SplitSquareImageFeature } from "./SplitSquareImageFeature";
import { SplitChecklistFeature } from "./SplitChecklistFeature";
import { FrameworkCardsFeature } from "./FrameworkCardsFeature";
import { CarouselProgressFeature } from "./CarouselProgressFeature";
import { PairedIconTilesFeature } from "./PairedIconTilesFeature";
import { IconCardGridFeature } from "./IconCardGridFeature";
import { SixUpIconGridFeature } from "./SixUpIconGridFeature";
import { HeroLinkedColumnsFeature } from "./HeroLinkedColumnsFeature";
import { IntegrationGridFeature } from "./IntegrationGridFeature";
import { FiveTabStoriesFeature } from "./FiveTabStoriesFeature";
import { ImageCardsFeature } from "./ImageCardsFeature";
import { NumberedStepsFeature } from "./NumberedStepsFeature";
import { TabsToAccordionFeature } from "./TabsToAccordionFeature";
import { CenteredImageGridFeature } from "./CenteredImageGridFeature";
import { UtilityBentoFeature } from "./UtilityBentoFeature";
import { SpotlightDetailsFeature } from "./SpotlightDetailsFeature";
import { AccordionChooserFeature } from "./AccordionChooserFeature";
import { ThreeStepConnectorFeature } from "./ThreeStepConnectorFeature";
import { LearnMoreCardsFeature } from "./LearnMoreCardsFeature";
import { ChecklistCardsFeature } from "./ChecklistCardsFeature";
import { HoverHighlightGridFeature } from "./HoverHighlightGridFeature";

export default function FeaturePageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.feature;

  const examples: UIExample[] = [
    {
      id: "feature-1",
      title: t.feature1TabTitle,
      description: t.feature1TabDescription,
      render: () => <SplitSquareImageFeature />,
    },
    {
      id: "feature-6",
      title: t.feature6TabTitle,
      description: t.feature6TabDescription,
      render: () => <SplitChecklistFeature />,
    },
    {
      id: "feature-8",
      title: t.feature8TabTitle,
      description: t.feature8TabDescription,
      render: () => <FrameworkCardsFeature />,
    },
    {
      id: "feature-12",
      title: t.feature12TabTitle,
      description: t.feature12TabDescription,
      render: () => <CarouselProgressFeature />,
    },
    {
      id: "feature-15",
      title: t.feature15TabTitle,
      description: t.feature15TabDescription,
      render: () => <PairedIconTilesFeature />,
    },
    {
      id: "feature-18",
      title: t.feature18TabTitle,
      description: t.feature18TabDescription,
      render: () => <IconCardGridFeature />,
    },
    {
      id: "feature-26",
      title: t.feature26TabTitle,
      description: t.feature26TabDescription,
      render: () => <SixUpIconGridFeature />,
    },
    {
      id: "feature-33",
      title: t.feature33TabTitle,
      description: t.feature33TabDescription,
      render: () => <HeroLinkedColumnsFeature />,
    },
    {
      id: "feature-44",
      title: t.feature44TabTitle,
      description: t.feature44TabDescription,
      render: () => <IntegrationGridFeature />,
    },
    {
      id: "feature-54",
      title: t.feature54TabTitle,
      description: t.feature54TabDescription,
      render: () => <FiveTabStoriesFeature />,
    },
    {
      id: "feature-72",
      title: t.feature72TabTitle,
      description: t.feature72TabDescription,
      render: () => <ImageCardsFeature />,
    },
    {
      id: "feature-99",
      title: t.feature99TabTitle,
      description: t.feature99TabDescription,
      render: () => <NumberedStepsFeature />,
    },
    {
      id: "feature-106",
      title: t.feature106TabTitle,
      description: t.feature106TabDescription,
      render: () => <TabsToAccordionFeature />,
    },
    {
      id: "feature-115",
      title: t.feature115TabTitle,
      description: t.feature115TabDescription,
      render: () => <CenteredImageGridFeature />,
    },
    {
      id: "feature-127",
      title: t.feature127TabTitle,
      description: t.feature127TabDescription,
      render: () => <UtilityBentoFeature />,
    },
    {
      id: "feature-139",
      title: t.feature139TabTitle,
      description: t.feature139TabDescription,
      render: () => <SpotlightDetailsFeature />,
    },
    {
      id: "feature-145",
      title: t.feature145TabTitle,
      description: t.feature145TabDescription,
      render: () => <AccordionChooserFeature />,
    },
    {
      id: "feature-187",
      title: t.feature187TabTitle,
      description: t.feature187TabDescription,
      render: () => <ThreeStepConnectorFeature />,
    },
    {
      id: "feature-194",
      title: t.feature194TabTitle,
      description: t.feature194TabDescription,
      render: () => <LearnMoreCardsFeature />,
    },
    {
      id: "feature-203",
      title: t.feature203TabTitle,
      description: t.feature203TabDescription,
      render: () => <ChecklistCardsFeature />,
    },
    {
      id: "feature-276",
      title: t.feature276TabTitle,
      description: t.feature276TabDescription,
      render: () => <HoverHighlightGridFeature />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.featureTitle}
      intro={m.examples.featureDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
