"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AppDownloadFooter } from "./AppDownloadFooter";
import { TaglineLegalFooter } from "./TaglineLegalFooter";
import { CompactTwoColumnFooter } from "./CompactTwoColumnFooter";
import { PricingCtaFooter } from "./PricingCtaFooter";
import { LiveClockFooter } from "./LiveClockFooter";
import { GiantBrandCenteredFooter } from "./GiantBrandCenteredFooter";
import { StatusBadgeFooter } from "./StatusBadgeFooter";
import { DarkAccordionFooter } from "./DarkAccordionFooter";
import { MegaDropdownFooter } from "./MegaDropdownFooter";
import { CookieLanguageFooter } from "./CookieLanguageFooter";
import { AnimatedGlobeFooter } from "./AnimatedGlobeFooter";
import { ContactHeadlineFooter } from "./ContactHeadlineFooter";
import { NewsletterStatusFooter } from "./NewsletterStatusFooter";
import { CenteredCtaFooter } from "./CenteredCtaFooter";
import { CenteredContainerFooter } from "./CenteredContainerFooter";
import { NewsletterFormFooter } from "./NewsletterFormFooter";
import { SocialNewsletterLegalFooter } from "./SocialNewsletterLegalFooter";
import { AppLinksFooter } from "./AppLinksFooter";
import { DescriptionLegalFooter } from "./DescriptionLegalFooter";
import { SocialColumnsNewsletterFooter } from "./SocialColumnsNewsletterFooter";
import { GiantImageFooter } from "./GiantImageFooter";
import { TrialBannerFooter } from "./TrialBannerFooter";
import { ThreeColumnNewsletterFooter } from "./ThreeColumnNewsletterFooter";
import { TwoTierMegaFooter } from "./TwoTierMegaFooter";
import { IconLabeledColumnsFooter } from "./IconLabeledColumnsFooter";
import { ProfileCardFooter } from "./ProfileCardFooter";
import { AnimatedCtaFooter } from "./AnimatedCtaFooter";
import { NewsletterThemeToggleFooter } from "./NewsletterThemeToggleFooter";
import { DesignerBrandFooter } from "./DesignerBrandFooter";
import { AnimatedLogoNewsletterFooter } from "./AnimatedLogoNewsletterFooter";
import { MegaNewsletterContactFooter } from "./MegaNewsletterContactFooter";
import { MegaAccordionLinksFooter } from "./MegaAccordionLinksFooter";
import { LargeBrandCtaFooter } from "./LargeBrandCtaFooter";
import { BoxedPatternBarFooter } from "./BoxedPatternBarFooter";
import { MutedGridContrastBarFooter } from "./MutedGridContrastBarFooter";
import { MutedSplitContrastBarFooter } from "./MutedSplitContrastBarFooter";
import { TextSocialLinksFooter } from "./TextSocialLinksFooter";
import { AddressContactColumnFooter } from "./AddressContactColumnFooter";
import { InvertedNavFirstFooter } from "./InvertedNavFirstFooter";
import { SectionTitleIconsFooter } from "./SectionTitleIconsFooter";
import { SingleRowBarFooter } from "./SingleRowBarFooter";
import { NoLegalBarFooter } from "./NoLegalBarFooter";
import { InlineMetaWrapFooter } from "./InlineMetaWrapFooter";
import { LogoMenuBarFooter } from "./LogoMenuBarFooter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function FooterPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.footer;

  const examples: UIExample[] = [
    {
      id: "footer-1",
      title: t.footer1TabTitle,
      description: t.footer1TabDescription,
      render: () => <AppDownloadFooter />,
    },
    {
      id: "footer-2",
      title: t.footer2TabTitle,
      description: t.footer2TabDescription,
      render: () => <TaglineLegalFooter />,
    },
    {
      id: "footer-6",
      title: t.footer6TabTitle,
      description: t.footer6TabDescription,
      render: () => <CompactTwoColumnFooter />,
    },
    {
      id: "footer-9",
      title: t.footer9TabTitle,
      description: t.footer9TabDescription,
      render: () => <PricingCtaFooter />,
    },
    {
      id: "footer-10",
      title: t.footer10TabTitle,
      description: t.footer10TabDescription,
      render: () => <LiveClockFooter />,
    },
    {
      id: "footer-12",
      title: t.footer12TabTitle,
      description: t.footer12TabDescription,
      render: () => <GiantBrandCenteredFooter />,
    },
    {
      id: "footer-15",
      title: t.footer15TabTitle,
      description: t.footer15TabDescription,
      render: () => <StatusBadgeFooter />,
    },
    {
      id: "footer-16",
      title: t.footer16TabTitle,
      description: t.footer16TabDescription,
      render: () => <DarkAccordionFooter />,
    },
    {
      id: "footer-17",
      title: t.footer17TabTitle,
      description: t.footer17TabDescription,
      render: () => <MegaDropdownFooter />,
    },
    {
      id: "footer-18",
      title: t.footer18TabTitle,
      description: t.footer18TabDescription,
      render: () => <CookieLanguageFooter />,
    },
    {
      id: "footer-23",
      title: t.footer23TabTitle,
      description: t.footer23TabDescription,
      render: () => <AnimatedGlobeFooter />,
    },
    {
      id: "footer-24",
      title: t.footer24TabTitle,
      description: t.footer24TabDescription,
      render: () => <ContactHeadlineFooter />,
    },
    {
      id: "footer-28",
      title: t.footer28TabTitle,
      description: t.footer28TabDescription,
      render: () => <NewsletterStatusFooter />,
    },
    {
      id: "footer-32",
      title: t.footer32TabTitle,
      description: t.footer32TabDescription,
      render: () => <CenteredCtaFooter />,
    },
    {
      id: "footer-54",
      title: t.footer54TabTitle,
      description: t.footer54TabDescription,
      render: () => <CenteredContainerFooter />,
    },
    {
      id: "footer-3",
      title: t.footer3TabTitle,
      description: t.footer3TabDescription,
      render: () => <NewsletterFormFooter />,
    },
    {
      id: "footer-4",
      title: t.footer4TabTitle,
      description: t.footer4TabDescription,
      render: () => <SocialNewsletterLegalFooter />,
    },
    {
      id: "footer-5",
      title: t.footer5TabTitle,
      description: t.footer5TabDescription,
      render: () => <AppLinksFooter />,
    },
    {
      id: "footer-7",
      title: t.footer7TabTitle,
      description: t.footer7TabDescription,
      render: () => <DescriptionLegalFooter />,
    },
    {
      id: "footer-8",
      title: t.footer8TabTitle,
      description: t.footer8TabDescription,
      render: () => <SocialColumnsNewsletterFooter />,
    },
    {
      id: "footer-11",
      title: t.footer11TabTitle,
      description: t.footer11TabDescription,
      render: () => <GiantImageFooter />,
    },
    {
      id: "footer-13",
      title: t.footer13TabTitle,
      description: t.footer13TabDescription,
      render: () => <TrialBannerFooter />,
    },
    {
      id: "footer-14",
      title: t.footer14TabTitle,
      description: t.footer14TabDescription,
      render: () => <ThreeColumnNewsletterFooter />,
    },
    {
      id: "footer-19",
      title: t.footer19TabTitle,
      description: t.footer19TabDescription,
      render: () => <TwoTierMegaFooter />,
    },
    {
      id: "footer-21",
      title: t.footer21TabTitle,
      description: t.footer21TabDescription,
      render: () => <IconLabeledColumnsFooter />,
    },
    {
      id: "footer-25",
      title: t.footer25TabTitle,
      description: t.footer25TabDescription,
      render: () => <ProfileCardFooter />,
    },
    {
      id: "footer-27",
      title: t.footer27TabTitle,
      description: t.footer27TabDescription,
      render: () => <AnimatedCtaFooter />,
    },
    {
      id: "footer-29",
      title: t.footer29TabTitle,
      description: t.footer29TabDescription,
      render: () => <NewsletterThemeToggleFooter />,
    },
    {
      id: "footer-30",
      title: t.footer30TabTitle,
      description: t.footer30TabDescription,
      render: () => <DesignerBrandFooter />,
    },
    {
      id: "footer-31",
      title: t.footer31TabTitle,
      description: t.footer31TabDescription,
      render: () => <AnimatedLogoNewsletterFooter />,
    },
    {
      id: "footer-37",
      title: t.footer37TabTitle,
      description: t.footer37TabDescription,
      render: () => <MegaNewsletterContactFooter />,
    },
    {
      id: "footer-49",
      title: t.footer49TabTitle,
      description: t.footer49TabDescription,
      render: () => <MegaAccordionLinksFooter />,
    },
    {
      id: "footer-50",
      title: t.footer50TabTitle,
      description: t.footer50TabDescription,
      render: () => <LargeBrandCtaFooter />,
    },
    {
      id: "footer-51",
      title: t.footer51TabTitle,
      description: t.footer51TabDescription,
      render: () => <BoxedPatternBarFooter />,
    },
    {
      id: "footer-52",
      title: t.footer52TabTitle,
      description: t.footer52TabDescription,
      render: () => <MutedGridContrastBarFooter />,
    },
    {
      id: "footer-53",
      title: t.footer53TabTitle,
      description: t.footer53TabDescription,
      render: () => <MutedSplitContrastBarFooter />,
    },
    {
      id: "footer-55",
      title: t.footer55TabTitle,
      description: t.footer55TabDescription,
      render: () => <TextSocialLinksFooter />,
    },
    {
      id: "footer-56",
      title: t.footer56TabTitle,
      description: t.footer56TabDescription,
      render: () => <AddressContactColumnFooter />,
    },
    {
      id: "footer-57",
      title: t.footer57TabTitle,
      description: t.footer57TabDescription,
      render: () => <InvertedNavFirstFooter />,
    },
    {
      id: "footer-58",
      title: t.footer58TabTitle,
      description: t.footer58TabDescription,
      render: () => <SectionTitleIconsFooter />,
    },
    {
      id: "footer-59",
      title: t.footer59TabTitle,
      description: t.footer59TabDescription,
      render: () => <SingleRowBarFooter />,
    },
    {
      id: "footer-60",
      title: t.footer60TabTitle,
      description: t.footer60TabDescription,
      render: () => <NoLegalBarFooter />,
    },
    {
      id: "footer-61",
      title: t.footer61TabTitle,
      description: t.footer61TabDescription,
      render: () => <InlineMetaWrapFooter />,
    },
    {
      id: "footer-62",
      title: t.footer62TabTitle,
      description: t.footer62TabDescription,
      render: () => <LogoMenuBarFooter />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.footerTitle}
      intro={m.examples.footerDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="footer"
    />
  );
}
