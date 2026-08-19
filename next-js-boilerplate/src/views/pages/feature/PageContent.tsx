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
import { SplitLeftImageFeature } from "./SplitLeftImageFeature";
import { MaskedSplitFeature } from "./MaskedSplitFeature";
import { NumberedStepsTimelineFeature } from "./NumberedStepsTimelineFeature";
import { GlowingStarCardsFeature } from "./GlowingStarCardsFeature";
import { WorkflowStackStatsFeature } from "./WorkflowStackStatsFeature";
import { VerticalTabsPreviewFeature } from "./VerticalTabsPreviewFeature";
import { MarketingBentoFeature } from "./MarketingBentoFeature";
import { RoundedTabStripFeature } from "./RoundedTabStripFeature";
import { UtilityGridActionFeature } from "./UtilityGridActionFeature";
import { SubscribeSparklesFeature } from "./SubscribeSparklesFeature";
import { AuroraFeatureListFeature } from "./AuroraFeatureListFeature";
import { IntegrationNarrativeFeature } from "./IntegrationNarrativeFeature";
import { StaggeredBadgesFeature } from "./StaggeredBadgesFeature";
import { FeaturePanelBleedFeature } from "./FeaturePanelBleedFeature";
import { CapabilityTilesFeature } from "./CapabilityTilesFeature";
import { DashedRailsFeature } from "./DashedRailsFeature";
import { CrmHoverPanelsFeature } from "./CrmHoverPanelsFeature";
import { TestimonialStackFeature } from "./TestimonialStackFeature";
import { UtilityGridLinksFeature } from "./UtilityGridLinksFeature";
import { ScrollDrivenCardsFeature } from "./ScrollDrivenCardsFeature";
import { PatternedColumnsFeature } from "./PatternedColumnsFeature";
import { AsymmetricBentoFeature } from "./AsymmetricBentoFeature";
import { ServicesImageColumnsFeature } from "./ServicesImageColumnsFeature";
import { VerticalCarouselSplitFeature } from "./VerticalCarouselSplitFeature";
import { LinkPreviewStackFeature } from "./LinkPreviewStackFeature";
import { ComingSoonBandFeature } from "./ComingSoonBandFeature";
import { AlternatingImageRowsFeature } from "./AlternatingImageRowsFeature";
import { StudioGridFeature } from "./StudioGridFeature";
import { BrandMarqueeFeature } from "./BrandMarqueeFeature";
import { NetworkNodesFeature } from "./NetworkNodesFeature";
import { TeamFeaturesGridFeature } from "./TeamFeaturesGridFeature";
import { DottedFrameSplitFeature } from "./DottedFrameSplitFeature";
import { ChecklistPhotoSplitFeature } from "./ChecklistPhotoSplitFeature";
import { CenteredBentoFeature } from "./CenteredBentoFeature";
import { MetricsHoverGridFeature } from "./MetricsHoverGridFeature";
import { GlobeBeamsCardsFeature } from "./GlobeBeamsCardsFeature";
import { ValuesHeadingGridFeature } from "./ValuesHeadingGridFeature";
import { DenseFeatureGridFeature } from "./DenseFeatureGridFeature";
import { InlineLinkPreviewFeature } from "./InlineLinkPreviewFeature";
import { ImageValueCardsFeature } from "./ImageValueCardsFeature";
import { ImageTilesDualActionsFeature } from "./ImageTilesDualActionsFeature";
import { BadgeGradientGridFeature } from "./BadgeGradientGridFeature";
import { FourColumnReadMoreFeature } from "./FourColumnReadMoreFeature";
import { CarouselSyncAccordionFeature } from "./CarouselSyncAccordionFeature";
import { WithWithoutComparisonFeature } from "./WithWithoutComparisonFeature";
import { DashedTwoRowGridFeature } from "./DashedTwoRowGridFeature";
import { ChecklistFramedSpotlightFeature } from "./ChecklistFramedSpotlightFeature";
import { FramedImagesCopyFeature } from "./FramedImagesCopyFeature";
import { PhotoCardCarouselFeature } from "./PhotoCardCarouselFeature";
import { ImagePairColumnsFeature } from "./ImagePairColumnsFeature";
import { CanvasStepCardsFeature } from "./CanvasStepCardsFeature";
import { DottedFrameCarouselFeature } from "./DottedFrameCarouselFeature";
import { MutedGridFeature } from "./MutedGridFeature";
import { CenteredImageRowFeature } from "./CenteredImageRowFeature";
import { AccessibilityHeroFeature } from "./AccessibilityHeroFeature";
import { FrostedTilesFeature } from "./FrostedTilesFeature";
import { SquareImageDualLinksFeature } from "./SquareImageDualLinksFeature";
import { FeaturedMediaLinksFeature } from "./FeaturedMediaLinksFeature";
import { ThreeColumnFooterCtaFeature } from "./ThreeColumnFooterCtaFeature";

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
    {
      id: "feature-344",
      title: t.feature344TabTitle,
      description: t.feature344TabDescription,
      render: () => <SplitLeftImageFeature />,
    },
    {
      id: "feature-38",
      title: t.feature38TabTitle,
      description: t.feature38TabDescription,
      render: () => <MaskedSplitFeature />,
    },
    {
      id: "feature-102",
      title: t.feature102TabTitle,
      description: t.feature102TabDescription,
      render: () => <NumberedStepsTimelineFeature />,
    },
    {
      id: "feature-287",
      title: t.feature287TabTitle,
      description: t.feature287TabDescription,
      render: () => <GlowingStarCardsFeature />,
    },
    {
      id: "feature-118",
      title: t.feature118TabTitle,
      description: t.feature118TabDescription,
      render: () => <WorkflowStackStatsFeature />,
    },
    {
      id: "feature-175",
      title: t.feature175TabTitle,
      description: t.feature175TabDescription,
      render: () => <VerticalTabsPreviewFeature />,
    },
    {
      id: "feature-261",
      title: t.feature261TabTitle,
      description: t.feature261TabDescription,
      render: () => <MarketingBentoFeature />,
    },
    {
      id: "feature-211",
      title: t.feature211TabTitle,
      description: t.feature211TabDescription,
      render: () => <RoundedTabStripFeature />,
    },
    {
      id: "feature-148",
      title: t.feature148TabTitle,
      description: t.feature148TabDescription,
      render: () => <UtilityGridActionFeature />,
    },
    {
      id: "feature-293",
      title: t.feature293TabTitle,
      description: t.feature293TabDescription,
      render: () => <SubscribeSparklesFeature />,
    },
    {
      id: "feature-271",
      title: t.feature271TabTitle,
      description: t.feature271TabDescription,
      render: () => <AuroraFeatureListFeature />,
    },
    {
      id: "feature-130",
      title: t.feature130TabTitle,
      description: t.feature130TabDescription,
      render: () => <IntegrationNarrativeFeature />,
    },
    {
      id: "feature-152",
      title: t.feature152TabTitle,
      description: t.feature152TabDescription,
      render: () => <StaggeredBadgesFeature />,
    },
    {
      id: "feature-87",
      title: t.feature87TabTitle,
      description: t.feature87TabDescription,
      render: () => <FeaturePanelBleedFeature />,
    },
    {
      id: "feature-225",
      title: t.feature225TabTitle,
      description: t.feature225TabDescription,
      render: () => <CapabilityTilesFeature />,
    },
    {
      id: "feature-171",
      title: t.feature171TabTitle,
      description: t.feature171TabDescription,
      render: () => <DashedRailsFeature />,
    },
    {
      id: "feature-150",
      title: t.feature150TabTitle,
      description: t.feature150TabDescription,
      render: () => <CrmHoverPanelsFeature />,
    },
    {
      id: "feature-281",
      title: t.feature281TabTitle,
      description: t.feature281TabDescription,
      render: () => <TestimonialStackFeature />,
    },
    {
      id: "feature-20",
      title: t.feature20TabTitle,
      description: t.feature20TabDescription,
      render: () => <UtilityGridLinksFeature />,
    },
    {
      id: "feature-322",
      title: t.feature322TabTitle,
      description: t.feature322TabDescription,
      render: () => <ScrollDrivenCardsFeature />,
    },
    {
      id: "feature-219",
      title: t.feature219TabTitle,
      description: t.feature219TabDescription,
      render: () => <PatternedColumnsFeature />,
    },
    {
      id: "feature-193",
      title: t.feature193TabTitle,
      description: t.feature193TabDescription,
      render: () => <AsymmetricBentoFeature />,
    },
    {
      id: "feature-157",
      title: t.feature157TabTitle,
      description: t.feature157TabDescription,
      render: () => <ServicesImageColumnsFeature />,
    },
    {
      id: "feature-114",
      title: t.feature114TabTitle,
      description: t.feature114TabDescription,
      render: () => <VerticalCarouselSplitFeature />,
    },
    {
      id: "feature-289",
      title: t.feature289TabTitle,
      description: t.feature289TabDescription,
      render: () => <LinkPreviewStackFeature />,
    },
    {
      id: "feature-64",
      title: t.feature64TabTitle,
      description: t.feature64TabDescription,
      render: () => <ComingSoonBandFeature />,
    },
    {
      id: "feature-62",
      title: t.feature62TabTitle,
      description: t.feature62TabDescription,
      render: () => <AlternatingImageRowsFeature />,
    },
    {
      id: "feature-314",
      title: t.feature314TabTitle,
      description: t.feature314TabDescription,
      render: () => <StudioGridFeature />,
    },
    {
      id: "feature-285",
      title: t.feature285TabTitle,
      description: t.feature285TabDescription,
      render: () => <BrandMarqueeFeature />,
    },
    {
      id: "feature-250",
      title: t.feature250TabTitle,
      description: t.feature250TabDescription,
      render: () => <NetworkNodesFeature />,
    },
    {
      id: "feature-241",
      title: t.feature241TabTitle,
      description: t.feature241TabDescription,
      render: () => <TeamFeaturesGridFeature />,
    },
    {
      id: "feature-239",
      title: t.feature239TabTitle,
      description: t.feature239TabDescription,
      render: () => <DottedFrameSplitFeature />,
    },
    {
      id: "feature-227",
      title: t.feature227TabTitle,
      description: t.feature227TabDescription,
      render: () => <ChecklistPhotoSplitFeature />,
    },
    {
      id: "feature-206",
      title: t.feature206TabTitle,
      description: t.feature206TabDescription,
      render: () => <CenteredBentoFeature />,
    },
    {
      id: "feature-274",
      title: t.feature274TabTitle,
      description: t.feature274TabDescription,
      render: () => <MetricsHoverGridFeature />,
    },
    {
      id: "feature-251",
      title: t.feature251TabTitle,
      description: t.feature251TabDescription,
      render: () => <GlobeBeamsCardsFeature />,
    },
    {
      id: "feature-42",
      title: t.feature42TabTitle,
      description: t.feature42TabDescription,
      render: () => <ValuesHeadingGridFeature />,
    },
    {
      id: "feature-190",
      title: t.feature190TabTitle,
      description: t.feature190TabDescription,
      render: () => <DenseFeatureGridFeature />,
    },
    {
      id: "feature-288",
      title: t.feature288TabTitle,
      description: t.feature288TabDescription,
      render: () => <InlineLinkPreviewFeature />,
    },
    {
      id: "feature-137",
      title: t.feature137TabTitle,
      description: t.feature137TabDescription,
      render: () => <ImageValueCardsFeature />,
    },
    {
      id: "feature-182",
      title: t.feature182TabTitle,
      description: t.feature182TabDescription,
      render: () => <ImageTilesDualActionsFeature />,
    },
    {
      id: "feature-221",
      title: t.feature221TabTitle,
      description: t.feature221TabDescription,
      render: () => <BadgeGradientGridFeature />,
    },
    {
      id: "feature-277",
      title: t.feature277TabTitle,
      description: t.feature277TabDescription,
      render: () => <FourColumnReadMoreFeature />,
    },
    {
      id: "feature-70",
      title: t.feature70TabTitle,
      description: t.feature70TabDescription,
      render: () => <CarouselSyncAccordionFeature />,
    },
    {
      id: "feature-180",
      title: t.feature180TabTitle,
      description: t.feature180TabDescription,
      render: () => <WithWithoutComparisonFeature />,
    },
    {
      id: "feature-172",
      title: t.feature172TabTitle,
      description: t.feature172TabDescription,
      render: () => <DashedTwoRowGridFeature />,
    },
    {
      id: "feature-143",
      title: t.feature143TabTitle,
      description: t.feature143TabDescription,
      render: () => <ChecklistFramedSpotlightFeature />,
    },
    {
      id: "feature-30",
      title: t.feature30TabTitle,
      description: t.feature30TabDescription,
      render: () => <FramedImagesCopyFeature />,
    },
    {
      id: "feature-224",
      title: t.feature224TabTitle,
      description: t.feature224TabDescription,
      render: () => <PhotoCardCarouselFeature />,
    },
    {
      id: "feature-28",
      title: t.feature28TabTitle,
      description: t.feature28TabDescription,
      render: () => <ImagePairColumnsFeature />,
    },
    {
      id: "feature-275",
      title: t.feature275TabTitle,
      description: t.feature275TabDescription,
      render: () => <CanvasStepCardsFeature />,
    },
    {
      id: "feature-244",
      title: t.feature244TabTitle,
      description: t.feature244TabDescription,
      render: () => <DottedFrameCarouselFeature />,
    },
    {
      id: "feature-278",
      title: t.feature278TabTitle,
      description: t.feature278TabDescription,
      render: () => <MutedGridFeature />,
    },
    {
      id: "feature-23",
      title: t.feature23TabTitle,
      description: t.feature23TabDescription,
      render: () => <CenteredImageRowFeature />,
    },
    {
      id: "feature-217a",
      title: t.feature217aTabTitle,
      description: t.feature217aTabDescription,
      render: () => <AccessibilityHeroFeature />,
    },
    {
      id: "feature-217b",
      title: t.feature217bTabTitle,
      description: t.feature217bTabDescription,
      render: () => <FrostedTilesFeature />,
    },
    {
      id: "feature-80",
      title: t.feature80TabTitle,
      description: t.feature80TabDescription,
      render: () => <SquareImageDualLinksFeature />,
    },
    {
      id: "feature-79",
      title: t.feature79TabTitle,
      description: t.feature79TabDescription,
      render: () => <FeaturedMediaLinksFeature />,
    },
    {
      id: "feature-158",
      title: t.feature158TabTitle,
      description: t.feature158TabDescription,
      render: () => <ThreeColumnFooterCtaFeature />,
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
