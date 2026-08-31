"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
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
import { VideoCardsCarouselFeature } from "./VideoCardsCarouselFeature";
import { StepBadgesGridFeature } from "./StepBadgesGridFeature";
import { GradientHoverBentoFeature } from "./GradientHoverBentoFeature";
import { IntegrationCarouselFeature } from "./IntegrationCarouselFeature";
import { MetricsImageLinksFeature } from "./MetricsImageLinksFeature";
import { LayeredBrowserCardsFeature } from "./LayeredBrowserCardsFeature";
import { LinkedImageCardsFeature } from "./LinkedImageCardsFeature";
import { SolutionTilesBentoFeature } from "./SolutionTilesBentoFeature";
import { CollaborationQuoteFeature } from "./CollaborationQuoteFeature";
import { ThreeUpImageCardsFeature } from "./ThreeUpImageCardsFeature";
import { LayeredSplitListFeature } from "./LayeredSplitListFeature";
import { SlideDetailChecklistFeature } from "./SlideDetailChecklistFeature";
import { TabbedDemoFeature } from "./TabbedDemoFeature";
import { ImageStatCardsFeature } from "./ImageStatCardsFeature";
import { NumberedSplitHeadlineFeature } from "./NumberedSplitHeadlineFeature";
import { VideoStatsFeature } from "./VideoStatsFeature";
import { StickyStackedCardsFeature } from "./StickyStackedCardsFeature";
import { LinkedTitleColumnsFeature } from "./LinkedTitleColumnsFeature";
import { HeadlineOutlineBtnFeature } from "./HeadlineOutlineBtnFeature";
import { ContributorsHeaderFeature } from "./ContributorsHeaderFeature";
import { NumberedLogoMatrixFeature } from "./NumberedLogoMatrixFeature";
import { TiltedVisualBentoFeature } from "./TiltedVisualBentoFeature";
import { CapabilityBentoFeature } from "./CapabilityBentoFeature";
import { GradientIconListFeature } from "./GradientIconListFeature";
import { DenseMetricsCardsFeature } from "./DenseMetricsCardsFeature";
import { FlickerTilesFeature } from "./FlickerTilesFeature";
import { TwoLargePanelsFeature } from "./TwoLargePanelsFeature";
import { TabbedStatsPanelFeature } from "./TabbedStatsPanelFeature";
import { CenterImageListFeature } from "./CenterImageListFeature";
import { LeadSidebarBentoFeature } from "./LeadSidebarBentoFeature";
import { AvatarIconFeaturesFeature } from "./AvatarIconFeaturesFeature";
import { HeroSplitIconsFeature } from "./HeroSplitIconsFeature";
import { ArrowBeamsStepsFeature } from "./ArrowBeamsStepsFeature";
import { DraggablePhotoOrbitFeature } from "./DraggablePhotoOrbitFeature";
import { VideoCopyRowsFeature } from "./VideoCopyRowsFeature";
import { SimpleImageCardsFeature } from "./SimpleImageCardsFeature";
import { SystemPillarsFeature } from "./SystemPillarsFeature";
import { CenterImageIconHighlightsFeature } from "./CenterImageIconHighlightsFeature";
import { ProofStatStripFeature } from "./ProofStatStripFeature";
import { ResponsiveVideoGridFeature } from "./ResponsiveVideoGridFeature";
import { TwoColUtilityCardsFeature } from "./TwoColUtilityCardsFeature";
import { ProductGlowCardsFeature } from "./ProductGlowCardsFeature";
import { StaggeredTooltipCardsFeature } from "./StaggeredTooltipCardsFeature";
import { HeaderLinkImageGridFeature } from "./HeaderLinkImageGridFeature";
import { PatternedTabsFeature } from "./PatternedTabsFeature";
import { EditorialChecklistFeature } from "./EditorialChecklistFeature";
import { PillarChecklistTrioFeature } from "./PillarChecklistTrioFeature";
import { MaskedIllustrationChecklistFeature } from "./MaskedIllustrationChecklistFeature";
import { CityAddressGridFeature } from "./CityAddressGridFeature";
import { DottedListSplitFeature } from "./DottedListSplitFeature";
import { FullBleedSlideCarouselFeature } from "./FullBleedSlideCarouselFeature";
import { CenteredPitchTilesFeature } from "./CenteredPitchTilesFeature";
import { IconBlurbGridFeature } from "./IconBlurbGridFeature";
import { LineTabsScreenshotFeature } from "./LineTabsScreenshotFeature";
import { OrbitingAvatarRingsFeature } from "./OrbitingAvatarRingsFeature";
import { FourCellSpanGridFeature } from "./FourCellSpanGridFeature";
import { GradientLinkedFeaturesFeature } from "./GradientLinkedFeaturesFeature";
import { TiltedPanelStackFeature } from "./TiltedPanelStackFeature";
import { ServicesHoverCarouselFeature } from "./ServicesHoverCarouselFeature";
import { TallVisualBentoFeature } from "./TallVisualBentoFeature";
import { DarkenOverlayReadMoreFeature } from "./DarkenOverlayReadMoreFeature";
import { DualMarqueeBadgeRowsFeature } from "./DualMarqueeBadgeRowsFeature";
import { AccordionImagePanelFeature } from "./AccordionImagePanelFeature";
import { TextColumnLinkedTilesFeature } from "./TextColumnLinkedTilesFeature";
import { ImageTraySplitFeature } from "./ImageTraySplitFeature";
import { VerticalTabs169Feature } from "./VerticalTabs169Feature";
import { HiringPointerBandFeature } from "./HiringPointerBandFeature";
import { SixImageCardGridFeature } from "./SixImageCardGridFeature";
import { NumberedWorkflowSeparatorsFeature } from "./NumberedWorkflowSeparatorsFeature";
import { StackedNumberedSplitsFeature } from "./StackedNumberedSplitsFeature";
import { SquareMediaTabsCtaFeature } from "./SquareMediaTabsCtaFeature";
import { StickyMediaFeatureListFeature } from "./StickyMediaFeatureListFeature";
import { HeroBorderedIconGridFeature } from "./HeroBorderedIconGridFeature";
import { AuroraScaleMediaFeature } from "./AuroraScaleMediaFeature";
import { LargeGridArrowLinksFeature } from "./LargeGridArrowLinksFeature";
import { GradientRuleVerticalTabsFeature } from "./GradientRuleVerticalTabsFeature";
import { IntegrationHeadlineGridFeature } from "./IntegrationHeadlineGridFeature";
import { GlobeArrowButtonFeature } from "./GlobeArrowButtonFeature";
import { DualMutedColumnsPitchFeature } from "./DualMutedColumnsPitchFeature";
import { IconValuesStripFeature } from "./IconValuesStripFeature";
import { TieredToolCatalogFeature } from "./TieredToolCatalogFeature";
import { FannedImageCardsFeature } from "./FannedImageCardsFeature";
import { StatsLogosPhotoBentoFeature } from "./StatsLogosPhotoBentoFeature";
import { AsymmetricImageBentoFeature } from "./AsymmetricImageBentoFeature";
import { DashedIconColumnsFeature } from "./DashedIconColumnsFeature";
import { FramedIconGridFeature } from "./FramedIconGridFeature";
import { OverlayCardImageColumnsFeature } from "./OverlayCardImageColumnsFeature";
import { FramedMediaRailFeature } from "./FramedMediaRailFeature";
import { DeviceStageStatsFeature } from "./DeviceStageStatsFeature";
import { ChecklistOutlineShowcaseFeature } from "./ChecklistOutlineShowcaseFeature";
import { RightCarouselSyncAccordionFeature } from "./RightCarouselSyncAccordionFeature";
import { AlternatingIntroPairsFeature } from "./AlternatingIntroPairsFeature";
import { StackedIconTabsFeature } from "./StackedIconTabsFeature";
import { SocialIntegrationsStripFeature } from "./SocialIntegrationsStripFeature";
import { TiltedCardChecklistFeature } from "./TiltedCardChecklistFeature";
import { LogoRailBorderedGridFeature } from "./LogoRailBorderedGridFeature";
import { StackedAsymmetricCardsFeature } from "./StackedAsymmetricCardsFeature";
import { StatsVideoCopyFeature } from "./StatsVideoCopyFeature";
import { FourUpIntegrationIconsFeature } from "./FourUpIntegrationIconsFeature";
import { RoundStepIconTabsFeature } from "./RoundStepIconTabsFeature";
import { IntegrationMatrixHeroFeature } from "./IntegrationMatrixHeroFeature";
import { PatternedImageChecklistCtaFeature } from "./PatternedImageChecklistCtaFeature";
import { OutlineBadgeStepsWideImageFeature } from "./OutlineBadgeStepsWideImageFeature";
import { ThumbnailCrossfadeGalleryFeature } from "./ThumbnailCrossfadeGalleryFeature";
import { TwoByTwoIconGridFeature } from "./TwoByTwoIconGridFeature";
import { DualAudienceComparisonFeature } from "./DualAudienceComparisonFeature";
import { DevToolsSpotlightGridFeature } from "./DevToolsSpotlightGridFeature";
import { AccordionDesktopImageSyncFeature } from "./AccordionDesktopImageSyncFeature";
import { StoryHeroStatCardsFeature } from "./StoryHeroStatCardsFeature";
import { BentoBadgesAvatarCarouselFeature } from "./BentoBadgesAvatarCarouselFeature";
import { FramedImageTestimonialFeature } from "./FramedImageTestimonialFeature";
import { TwoCardBentoFeature } from "./TwoCardBentoFeature";
import { SoftFadeUpgradeColumnFeature } from "./SoftFadeUpgradeColumnFeature";
import { MutedAutoplayVideoStatsFeature } from "./MutedAutoplayVideoStatsFeature";
import { IconTabsSwappedImagesFeature } from "./IconTabsSwappedImagesFeature";

export default function FeaturePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
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
    {
      id: "feature-215",
      title: t.feature215TabTitle,
      description: t.feature215TabDescription,
      render: () => <VideoCardsCarouselFeature />,
    },
    {
      id: "feature-191",
      title: t.feature191TabTitle,
      description: t.feature191TabDescription,
      render: () => <StepBadgesGridFeature />,
    },
    {
      id: "feature-116",
      title: t.feature116TabTitle,
      description: t.feature116TabDescription,
      render: () => <GradientHoverBentoFeature />,
    },
    {
      id: "feature-153",
      title: t.feature153TabTitle,
      description: t.feature153TabDescription,
      render: () => <IntegrationCarouselFeature />,
    },
    {
      id: "feature-71",
      title: t.feature71TabTitle,
      description: t.feature71TabDescription,
      render: () => <MetricsImageLinksFeature />,
    },
    {
      id: "feature-238",
      title: t.feature238TabTitle,
      description: t.feature238TabDescription,
      render: () => <LayeredBrowserCardsFeature />,
    },
    {
      id: "feature-132",
      title: t.feature132TabTitle,
      description: t.feature132TabDescription,
      render: () => <LinkedImageCardsFeature />,
    },
    {
      id: "feature-202",
      title: t.feature202TabTitle,
      description: t.feature202TabDescription,
      render: () => <SolutionTilesBentoFeature />,
    },
    {
      id: "feature-4",
      title: t.feature4TabTitle,
      description: t.feature4TabDescription,
      render: () => <CollaborationQuoteFeature />,
    },
    {
      id: "feature-112",
      title: t.feature112TabTitle,
      description: t.feature112TabDescription,
      render: () => <ThreeUpImageCardsFeature />,
    },
    {
      id: "feature-189",
      title: t.feature189TabTitle,
      description: t.feature189TabDescription,
      render: () => <LayeredSplitListFeature />,
    },
    {
      id: "feature-19",
      title: t.feature19TabTitle,
      description: t.feature19TabDescription,
      render: () => <SlideDetailChecklistFeature />,
    },
    {
      id: "feature-78",
      title: t.feature78TabTitle,
      description: t.feature78TabDescription,
      render: () => <TabbedDemoFeature />,
    },
    {
      id: "feature-222",
      title: t.feature222TabTitle,
      description: t.feature222TabDescription,
      render: () => <ImageStatCardsFeature />,
    },
    {
      id: "feature-231",
      title: t.feature231TabTitle,
      description: t.feature231TabDescription,
      render: () => <NumberedSplitHeadlineFeature />,
    },
    {
      id: "feature-220a",
      title: t.feature220aTabTitle,
      description: t.feature220aTabDescription,
      render: () => <VideoStatsFeature />,
    },
    {
      id: "feature-135",
      title: t.feature135TabTitle,
      description: t.feature135TabDescription,
      render: () => <StickyStackedCardsFeature />,
    },
    {
      id: "feature-13",
      title: t.feature13TabTitle,
      description: t.feature13TabDescription,
      render: () => <LinkedTitleColumnsFeature />,
    },
    {
      id: "feature-55",
      title: t.feature55TabTitle,
      description: t.feature55TabDescription,
      render: () => <HeadlineOutlineBtnFeature />,
    },
    {
      id: "feature-255",
      title: t.feature255TabTitle,
      description: t.feature255TabDescription,
      render: () => <ContributorsHeaderFeature />,
    },
    {
      id: "feature-53",
      title: t.feature53TabTitle,
      description: t.feature53TabDescription,
      render: () => <NumberedLogoMatrixFeature />,
    },
    {
      id: "feature-269",
      title: t.feature269TabTitle,
      description: t.feature269TabDescription,
      render: () => <TiltedVisualBentoFeature />,
    },
    {
      id: "feature-101",
      title: t.feature101TabTitle,
      description: t.feature101TabDescription,
      render: () => <CapabilityBentoFeature />,
    },
    {
      id: "feature-200",
      title: t.feature200TabTitle,
      description: t.feature200TabDescription,
      render: () => <GradientIconListFeature />,
    },
    {
      id: "feature-237",
      title: t.feature237TabTitle,
      description: t.feature237TabDescription,
      render: () => <DenseMetricsCardsFeature />,
    },
    {
      id: "feature-235",
      title: t.feature235TabTitle,
      description: t.feature235TabDescription,
      render: () => <FlickerTilesFeature />,
    },
    {
      id: "feature-74",
      title: t.feature74TabTitle,
      description: t.feature74TabDescription,
      render: () => <TwoLargePanelsFeature />,
    },
    {
      id: "feature-205",
      title: t.feature205TabTitle,
      description: t.feature205TabDescription,
      render: () => <TabbedStatsPanelFeature />,
    },
    {
      id: "feature-245",
      title: t.feature245TabTitle,
      description: t.feature245TabDescription,
      render: () => <CenterImageListFeature />,
    },
    {
      id: "feature-59",
      title: t.feature59TabTitle,
      description: t.feature59TabDescription,
      render: () => <LeadSidebarBentoFeature />,
    },
    {
      id: "feature-93",
      title: t.feature93TabTitle,
      description: t.feature93TabDescription,
      render: () => <AvatarIconFeaturesFeature />,
    },
    {
      id: "feature-230",
      title: t.feature230TabTitle,
      description: t.feature230TabDescription,
      render: () => <HeroSplitIconsFeature />,
    },
    {
      id: "feature-272",
      title: t.feature272TabTitle,
      description: t.feature272TabDescription,
      render: () => <ArrowBeamsStepsFeature />,
    },
    {
      id: "feature-283",
      title: t.feature283TabTitle,
      description: t.feature283TabDescription,
      render: () => <DraggablePhotoOrbitFeature />,
    },
    {
      id: "feature-215b",
      title: t.feature215bTabTitle,
      description: t.feature215bTabDescription,
      render: () => <VideoCopyRowsFeature />,
    },
    {
      id: "feature-39",
      title: t.feature39TabTitle,
      description: t.feature39TabDescription,
      render: () => <SimpleImageCardsFeature />,
    },
    {
      id: "feature-299",
      title: t.feature299TabTitle,
      description: t.feature299TabDescription,
      render: () => <SystemPillarsFeature />,
    },
    {
      id: "feature-104",
      title: t.feature104TabTitle,
      description: t.feature104TabDescription,
      render: () => <CenterImageIconHighlightsFeature />,
    },
    {
      id: "feature-120",
      title: t.feature120TabTitle,
      description: t.feature120TabDescription,
      render: () => <ProofStatStripFeature />,
    },
    {
      id: "feature-215a",
      title: t.feature215aTabTitle,
      description: t.feature215aTabDescription,
      render: () => <ResponsiveVideoGridFeature />,
    },
    {
      id: "feature-21",
      title: t.feature21TabTitle,
      description: t.feature21TabDescription,
      render: () => <TwoColUtilityCardsFeature />,
    },
    {
      id: "feature-286",
      title: t.feature286TabTitle,
      description: t.feature286TabDescription,
      render: () => <ProductGlowCardsFeature />,
    },
    {
      id: "feature-266",
      title: t.feature266TabTitle,
      description: t.feature266TabDescription,
      render: () => <StaggeredTooltipCardsFeature />,
    },
    {
      id: "feature-73",
      title: t.feature73TabTitle,
      description: t.feature73TabDescription,
      render: () => <HeaderLinkImageGridFeature />,
    },
    {
      id: "feature-186",
      title: t.feature186TabTitle,
      description: t.feature186TabDescription,
      render: () => <PatternedTabsFeature />,
    },
    {
      id: "feature-58",
      title: t.feature58TabTitle,
      description: t.feature58TabDescription,
      render: () => <EditorialChecklistFeature />,
    },
    {
      id: "feature-229",
      title: t.feature229TabTitle,
      description: t.feature229TabDescription,
      render: () => <PillarChecklistTrioFeature />,
    },
    {
      id: "feature-125",
      title: t.feature125TabTitle,
      description: t.feature125TabDescription,
      render: () => <MaskedIllustrationChecklistFeature />,
    },
    {
      id: "feature-41",
      title: t.feature41TabTitle,
      description: t.feature41TabDescription,
      render: () => <CityAddressGridFeature />,
    },
    {
      id: "feature-11",
      title: t.feature11TabTitle,
      description: t.feature11TabDescription,
      render: () => <DottedListSplitFeature />,
    },
    {
      id: "feature-140",
      title: t.feature140TabTitle,
      description: t.feature140TabDescription,
      render: () => <FullBleedSlideCarouselFeature />,
    },
    {
      id: "feature-50",
      title: t.feature50TabTitle,
      description: t.feature50TabDescription,
      render: () => <CenteredPitchTilesFeature />,
    },
    {
      id: "feature-128",
      title: t.feature128TabTitle,
      description: t.feature128TabDescription,
      render: () => <IconBlurbGridFeature />,
    },
    {
      id: "feature-169",
      title: t.feature169TabTitle,
      description: t.feature169TabDescription,
      render: () => <LineTabsScreenshotFeature />,
    },
    {
      id: "feature-254",
      title: t.feature254TabTitle,
      description: t.feature254TabDescription,
      render: () => <OrbitingAvatarRingsFeature />,
    },
    {
      id: "feature-163",
      title: t.feature163TabTitle,
      description: t.feature163TabDescription,
      render: () => <FourCellSpanGridFeature />,
    },
    {
      id: "feature-123",
      title: t.feature123TabTitle,
      description: t.feature123TabDescription,
      render: () => <GradientLinkedFeaturesFeature />,
    },
    {
      id: "feature-270",
      title: t.feature270TabTitle,
      description: t.feature270TabDescription,
      render: () => <TiltedPanelStackFeature />,
    },
    {
      id: "feature-240",
      title: t.feature240TabTitle,
      description: t.feature240TabDescription,
      render: () => <ServicesHoverCarouselFeature />,
    },
    {
      id: "feature-133",
      title: t.feature133TabTitle,
      description: t.feature133TabDescription,
      render: () => <TallVisualBentoFeature />,
    },
    {
      id: "feature-81",
      title: t.feature81TabTitle,
      description: t.feature81TabDescription,
      render: () => <DarkenOverlayReadMoreFeature />,
    },
    {
      id: "feature-154",
      title: t.feature154TabTitle,
      description: t.feature154TabDescription,
      render: () => <DualMarqueeBadgeRowsFeature />,
    },
    {
      id: "feature-197",
      title: t.feature197TabTitle,
      description: t.feature197TabDescription,
      render: () => <AccordionImagePanelFeature />,
    },
    {
      id: "feature-75",
      title: t.feature75TabTitle,
      description: t.feature75TabDescription,
      render: () => <TextColumnLinkedTilesFeature />,
    },
    {
      id: "feature-86",
      title: t.feature86TabTitle,
      description: t.feature86TabDescription,
      render: () => <ImageTraySplitFeature />,
    },
    {
      id: "feature-213",
      title: t.feature213TabTitle,
      description: t.feature213TabDescription,
      render: () => <VerticalTabs169Feature />,
    },
    {
      id: "feature-292",
      title: t.feature292TabTitle,
      description: t.feature292TabDescription,
      render: () => <HiringPointerBandFeature />,
    },
    {
      id: "feature-63",
      title: t.feature63TabTitle,
      description: t.feature63TabDescription,
      render: () => <SixImageCardGridFeature />,
    },
    {
      id: "feature-207",
      title: t.feature207TabTitle,
      description: t.feature207TabDescription,
      render: () => <NumberedWorkflowSeparatorsFeature />,
    },
    {
      id: "feature-14",
      title: t.feature14TabTitle,
      description: t.feature14TabDescription,
      render: () => <StackedNumberedSplitsFeature />,
    },
    {
      id: "feature-164",
      title: t.feature164TabTitle,
      description: t.feature164TabDescription,
      render: () => <SquareMediaTabsCtaFeature />,
    },
    {
      id: "feature-199",
      title: t.feature199TabTitle,
      description: t.feature199TabDescription,
      render: () => <StickyMediaFeatureListFeature />,
    },
    {
      id: "feature-85",
      title: t.feature85TabTitle,
      description: t.feature85TabDescription,
      render: () => <HeroBorderedIconGridFeature />,
    },
    {
      id: "feature-249",
      title: t.feature249TabTitle,
      description: t.feature249TabDescription,
      render: () => <AuroraScaleMediaFeature />,
    },
    {
      id: "feature-35",
      title: t.feature35TabTitle,
      description: t.feature35TabDescription,
      render: () => <LargeGridArrowLinksFeature />,
    },
    {
      id: "feature-167",
      title: t.feature167TabTitle,
      description: t.feature167TabDescription,
      render: () => <GradientRuleVerticalTabsFeature />,
    },
    {
      id: "feature-82",
      title: t.feature82TabTitle,
      description: t.feature82TabDescription,
      render: () => <IntegrationHeadlineGridFeature />,
    },
    {
      id: "feature-253",
      title: t.feature253TabTitle,
      description: t.feature253TabDescription,
      render: () => <GlobeArrowButtonFeature />,
    },
    {
      id: "feature-111",
      title: t.feature111TabTitle,
      description: t.feature111TabDescription,
      render: () => <DualMutedColumnsPitchFeature />,
    },
    {
      id: "feature-170",
      title: t.feature170TabTitle,
      description: t.feature170TabDescription,
      render: () => <IconValuesStripFeature />,
    },
    {
      id: "feature-257",
      title: t.feature257TabTitle,
      description: t.feature257TabDescription,
      render: () => <TieredToolCatalogFeature />,
    },
    {
      id: "feature-234",
      title: t.feature234TabTitle,
      description: t.feature234TabDescription,
      render: () => <FannedImageCardsFeature />,
    },
    {
      id: "feature-34",
      title: t.feature34TabTitle,
      description: t.feature34TabDescription,
      render: () => <StatsLogosPhotoBentoFeature />,
    },
    {
      id: "feature-37",
      title: t.feature37TabTitle,
      description: t.feature37TabDescription,
      render: () => <AsymmetricImageBentoFeature />,
    },
    {
      id: "feature-10",
      title: t.feature10TabTitle,
      description: t.feature10TabDescription,
      render: () => <DashedIconColumnsFeature />,
    },
    {
      id: "feature-68",
      title: t.feature68TabTitle,
      description: t.feature68TabDescription,
      render: () => <FramedIconGridFeature />,
    },
    {
      id: "feature-117",
      title: t.feature117TabTitle,
      description: t.feature117TabDescription,
      render: () => <OverlayCardImageColumnsFeature />,
    },
    {
      id: "feature-168",
      title: t.feature168TabTitle,
      description: t.feature168TabDescription,
      render: () => <FramedMediaRailFeature />,
    },
    {
      id: "feature-183",
      title: t.feature183TabTitle,
      description: t.feature183TabDescription,
      render: () => <DeviceStageStatsFeature />,
    },
    {
      id: "feature-22",
      title: t.feature22TabTitle,
      description: t.feature22TabDescription,
      render: () => <ChecklistOutlineShowcaseFeature />,
    },
    {
      id: "feature-69",
      title: t.feature69TabTitle,
      description: t.feature69TabDescription,
      render: () => <RightCarouselSyncAccordionFeature />,
    },
    {
      id: "feature-31",
      title: t.feature31TabTitle,
      description: t.feature31TabDescription,
      render: () => <AlternatingIntroPairsFeature />,
    },
    {
      id: "feature-51",
      title: t.feature51TabTitle,
      description: t.feature51TabDescription,
      render: () => <StackedIconTabsFeature />,
    },
    {
      id: "feature-92",
      title: t.feature92TabTitle,
      description: t.feature92TabDescription,
      render: () => <SocialIntegrationsStripFeature />,
    },
    {
      id: "feature-268",
      title: t.feature268TabTitle,
      description: t.feature268TabDescription,
      render: () => <TiltedCardChecklistFeature />,
    },
    {
      id: "feature-161",
      title: t.feature161TabTitle,
      description: t.feature161TabDescription,
      render: () => <LogoRailBorderedGridFeature />,
    },
    {
      id: "feature-144",
      title: t.feature144TabTitle,
      description: t.feature144TabDescription,
      render: () => <StackedAsymmetricCardsFeature />,
    },
    {
      id: "feature-220b",
      title: t.feature220bTabTitle,
      description: t.feature220bTabDescription,
      render: () => <StatsVideoCopyFeature />,
    },
    {
      id: "feature-159",
      title: t.feature159TabTitle,
      description: t.feature159TabDescription,
      render: () => <FourUpIntegrationIconsFeature />,
    },
    {
      id: "feature-216",
      title: t.feature216TabTitle,
      description: t.feature216TabDescription,
      render: () => <RoundStepIconTabsFeature />,
    },
    {
      id: "feature-147",
      title: t.feature147TabTitle,
      description: t.feature147TabDescription,
      render: () => <IntegrationMatrixHeroFeature />,
    },
    {
      id: "feature-124",
      title: t.feature124TabTitle,
      description: t.feature124TabDescription,
      render: () => <PatternedImageChecklistCtaFeature />,
    },
    {
      id: "feature-119",
      title: t.feature119TabTitle,
      description: t.feature119TabDescription,
      render: () => <OutlineBadgeStepsWideImageFeature />,
    },
    {
      id: "feature-209",
      title: t.feature209TabTitle,
      description: t.feature209TabDescription,
      render: () => <ThumbnailCrossfadeGalleryFeature />,
    },
    {
      id: "feature-97",
      title: t.feature97TabTitle,
      description: t.feature97TabDescription,
      render: () => <TwoByTwoIconGridFeature />,
    },
    {
      id: "feature-91",
      title: t.feature91TabTitle,
      description: t.feature91TabDescription,
      render: () => <DualAudienceComparisonFeature />,
    },
    {
      id: "feature-256",
      title: t.feature256TabTitle,
      description: t.feature256TabDescription,
      render: () => <DevToolsSpotlightGridFeature />,
    },
    {
      id: "feature-192",
      title: t.feature192TabTitle,
      description: t.feature192TabDescription,
      render: () => <AccordionDesktopImageSyncFeature />,
    },
    {
      id: "feature-312",
      title: t.feature312TabTitle,
      description: t.feature312TabDescription,
      render: () => <StoryHeroStatCardsFeature />,
    },
    {
      id: "feature-110",
      title: t.feature110TabTitle,
      description: t.feature110TabDescription,
      render: () => <BentoBadgesAvatarCarouselFeature />,
    },
    {
      id: "feature-141",
      title: t.feature141TabTitle,
      description: t.feature141TabDescription,
      render: () => <FramedImageTestimonialFeature />,
    },
    {
      id: "feature-5",
      title: t.feature5TabTitle,
      description: t.feature5TabDescription,
      render: () => <TwoCardBentoFeature />,
    },
    {
      id: "feature-218",
      title: t.feature218TabTitle,
      description: t.feature218TabDescription,
      render: () => <SoftFadeUpgradeColumnFeature />,
    },
    {
      id: "feature-220",
      title: t.feature220TabTitle,
      description: t.feature220TabDescription,
      render: () => <MutedAutoplayVideoStatsFeature />,
    },
    {
      id: "feature-105",
      title: t.feature105TabTitle,
      description: t.feature105TabDescription,
      render: () => <IconTabsSwappedImagesFeature />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.featureTitle}
      intro={m.examples.featureDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="feature"
    />
  );
}
