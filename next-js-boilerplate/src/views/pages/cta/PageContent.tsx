"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { CardIconCta } from "./CardIconCta";
import { LinkCardsCta } from "./LinkCardsCta";
import { MutedFeatureChecklistCta } from "./MutedFeatureChecklistCta";
import { SideImageCta } from "./SideImageCta";
import { StackedPanelsCta } from "./StackedPanelsCta";
import { FeatureChecklistCta } from "./FeatureChecklistCta";
import { BandedDualButtonsCta } from "./BandedDualButtonsCta";
import { BorderedIconCta } from "./BorderedIconCta";
import { CenteredAccentCta } from "./CenteredAccentCta";
import { LeftAccentDualCta } from "./LeftAccentDualCta";
import { ContainedGradientCta } from "./ContainedGradientCta";
import { GradientPanelPhotoCta } from "./GradientPanelPhotoCta";
import { ContainedFlatCta } from "./ContainedFlatCta";
import { CirclePatternCta } from "./CirclePatternCta";
import { AngledSplitCta } from "./AngledSplitCta";
import { ResourceLinksCta } from "./ResourceLinksCta";
import { LineSeparatorCta } from "./LineSeparatorCta";
import { TextShadowImageCta } from "./TextShadowImageCta";
import { AppDownloadNewsletterCta } from "./AppDownloadNewsletterCta";
import { NewsletterBandCta } from "./NewsletterBandCta";
import { PhotoBannerLinkCardsCta } from "./PhotoBannerLinkCardsCta";
import { EnterpriseLayeredCta } from "./EnterpriseLayeredCta";
import { AvatarTeamCta } from "./AvatarTeamCta";
import { LogoArcCta } from "./LogoArcCta";
import { PatternPanelIconCta } from "./PatternPanelIconCta";
import { TopBorderCta } from "./TopBorderCta";
import { LeftBorderStripeCta } from "./LeftBorderStripeCta";
import { InlineSplitCta } from "./InlineSplitCta";
import { BorderedGridSplitCta } from "./BorderedGridSplitCta";
import { InvertedCardCta } from "./InvertedCardCta";
import { DashedOutlineCta } from "./DashedOutlineCta";
import { GradientPricingCta } from "./GradientPricingCta";
import { DottedPanelCta } from "./DottedPanelCta";
import { RadialContainedCta } from "./RadialContainedCta";
import { FullWidthGradientCta } from "./FullWidthGradientCta";
import { FullWidthFlatCta } from "./FullWidthFlatCta";
import { FullWidthTextShadowCta } from "./FullWidthTextShadowCta";
import { FullWidthRadialCta } from "./FullWidthRadialCta";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CtaPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.cta;

  const examples: UIExample[] = [
    {
      id: "cta-1",
      title: t.cta1TabTitle,
      description: t.cta1TabDescription,
      render: () => <CardIconCta />,
    },
    {
      id: "cta-3",
      title: t.cta3TabTitle,
      description: t.cta3TabDescription,
      render: () => <LinkCardsCta />,
    },
    {
      id: "cta-4",
      title: t.cta4TabTitle,
      description: t.cta4TabDescription,
      render: () => <MutedFeatureChecklistCta />,
    },
    {
      id: "cta-5",
      title: t.cta5TabTitle,
      description: t.cta5TabDescription,
      render: () => <SideImageCta />,
    },
    {
      id: "cta-6",
      title: t.cta6TabTitle,
      description: t.cta6TabDescription,
      render: () => <StackedPanelsCta />,
    },
    {
      id: "cta-7",
      title: t.cta7TabTitle,
      description: t.cta7TabDescription,
      render: () => <FeatureChecklistCta />,
    },
    {
      id: "cta-10",
      title: t.cta10TabTitle,
      description: t.cta10TabDescription,
      render: () => <BandedDualButtonsCta />,
    },
    {
      id: "cta-11",
      title: t.cta11TabTitle,
      description: t.cta11TabDescription,
      render: () => <BorderedIconCta />,
    },
    {
      id: "cta-12",
      title: t.cta12TabTitle,
      description: t.cta12TabDescription,
      render: () => <CenteredAccentCta />,
    },
    {
      id: "cta-13",
      title: t.cta13TabTitle,
      description: t.cta13TabDescription,
      render: () => <LeftAccentDualCta />,
    },
    {
      id: "cta-14",
      title: t.cta14TabTitle,
      description: t.cta14TabDescription,
      render: () => <ContainedGradientCta />,
    },
    {
      id: "cta-15",
      title: t.cta15TabTitle,
      description: t.cta15TabDescription,
      render: () => <GradientPanelPhotoCta />,
    },
    {
      id: "cta-16",
      title: t.cta16TabTitle,
      description: t.cta16TabDescription,
      render: () => <ContainedFlatCta />,
    },
    {
      id: "cta-17",
      title: t.cta17TabTitle,
      description: t.cta17TabDescription,
      render: () => <CirclePatternCta />,
    },
    {
      id: "cta-18",
      title: t.cta18TabTitle,
      description: t.cta18TabDescription,
      render: () => <AngledSplitCta />,
    },
    {
      id: "cta-19",
      title: t.cta19TabTitle,
      description: t.cta19TabDescription,
      render: () => <ResourceLinksCta />,
    },
    {
      id: "cta-20",
      title: t.cta20TabTitle,
      description: t.cta20TabDescription,
      render: () => <LineSeparatorCta />,
    },
    {
      id: "cta-21",
      title: t.cta21TabTitle,
      description: t.cta21TabDescription,
      render: () => <TextShadowImageCta />,
    },
    {
      id: "cta-22",
      title: t.cta22TabTitle,
      description: t.cta22TabDescription,
      render: () => <AppDownloadNewsletterCta />,
    },
    {
      id: "cta-23",
      title: t.cta23TabTitle,
      description: t.cta23TabDescription,
      render: () => <NewsletterBandCta />,
    },
    {
      id: "cta-26",
      title: t.cta26TabTitle,
      description: t.cta26TabDescription,
      render: () => <PhotoBannerLinkCardsCta />,
    },
    {
      id: "cta-28",
      title: t.cta28TabTitle,
      description: t.cta28TabDescription,
      render: () => <EnterpriseLayeredCta />,
    },
    {
      id: "cta-30",
      title: t.cta30TabTitle,
      description: t.cta30TabDescription,
      render: () => <AvatarTeamCta />,
    },
    {
      id: "cta-31",
      title: t.cta31TabTitle,
      description: t.cta31TabDescription,
      render: () => <LogoArcCta />,
    },
    {
      id: "cta-32",
      title: t.cta32TabTitle,
      description: t.cta32TabDescription,
      render: () => <PatternPanelIconCta />,
    },
    {
      id: "cta-34",
      title: t.cta34TabTitle,
      description: t.cta34TabDescription,
      render: () => <TopBorderCta />,
    },
    {
      id: "cta-35",
      title: t.cta35TabTitle,
      description: t.cta35TabDescription,
      render: () => <LeftBorderStripeCta />,
    },
    {
      id: "cta-36",
      title: t.cta36TabTitle,
      description: t.cta36TabDescription,
      render: () => <InlineSplitCta />,
    },
    {
      id: "cta-37",
      title: t.cta37TabTitle,
      description: t.cta37TabDescription,
      render: () => <BorderedGridSplitCta />,
    },
    {
      id: "cta-38",
      title: t.cta38TabTitle,
      description: t.cta38TabDescription,
      render: () => <InvertedCardCta />,
    },
    {
      id: "cta-39",
      title: t.cta39TabTitle,
      description: t.cta39TabDescription,
      render: () => <DashedOutlineCta />,
    },
    {
      id: "cta-40",
      title: t.cta40TabTitle,
      description: t.cta40TabDescription,
      render: () => <GradientPricingCta />,
    },
    {
      id: "cta-41",
      title: t.cta41TabTitle,
      description: t.cta41TabDescription,
      render: () => <DottedPanelCta />,
    },
    {
      id: "cta-42",
      title: t.cta42TabTitle,
      description: t.cta42TabDescription,
      render: () => <RadialContainedCta />,
    },
    {
      id: "cta-43",
      title: t.cta43TabTitle,
      description: t.cta43TabDescription,
      render: () => <FullWidthGradientCta />,
    },
    {
      id: "cta-44",
      title: t.cta44TabTitle,
      description: t.cta44TabDescription,
      render: () => <FullWidthFlatCta />,
    },
    {
      id: "cta-45",
      title: t.cta45TabTitle,
      description: t.cta45TabDescription,
      render: () => <FullWidthTextShadowCta />,
    },
    {
      id: "cta-46",
      title: t.cta46TabTitle,
      description: t.cta46TabDescription,
      render: () => <FullWidthRadialCta />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.ctaTitle}
      intro={m.examples.ctaDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
