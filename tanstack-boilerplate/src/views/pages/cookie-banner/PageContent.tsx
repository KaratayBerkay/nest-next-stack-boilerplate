"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { BottomBarMinimalCookieBanner } from "./BottomBarMinimalCookieBanner";
import { BottomBarPolicyLinkCookieBanner } from "./BottomBarPolicyLinkCookieBanner";
import { BottomBarIconCookieBanner } from "./BottomBarIconCookieBanner";
import { CornerCardBottomLeftCookieBanner } from "./CornerCardBottomLeftCookieBanner";
import { CornerCardDismissCookieBanner } from "./CornerCardDismissCookieBanner";
import { CornerCardBottomRightCookieBanner } from "./CornerCardBottomRightCookieBanner";
import { CornerCardLinkDrawerCookieBanner } from "./CornerCardLinkDrawerCookieBanner";
import { ExpandingBottomPanelCookieBanner } from "./ExpandingBottomPanelCookieBanner";
import { BottomBarDialogCookieBanner } from "./BottomBarDialogCookieBanner";
import { CornerCardCheckboxExpandCookieBanner } from "./CornerCardCheckboxExpandCookieBanner";
import { CornerCardDialogCookieBanner } from "./CornerCardDialogCookieBanner";
import { CornerCardAccordionCookieBanner } from "./CornerCardAccordionCookieBanner";
import { CornerCardSheetCookieBanner } from "./CornerCardSheetCookieBanner";
import { FullWidthSwitchPanelCookieBanner } from "./FullWidthSwitchPanelCookieBanner";
import { CategoryTilesPanelCookieBanner } from "./CategoryTilesPanelCookieBanner";
import { SplitPresetPanelCookieBanner } from "./SplitPresetPanelCookieBanner";
import { CenteredModalSimpleCookieBanner } from "./CenteredModalSimpleCookieBanner";
import { CenteredModalDetailedCookieBanner } from "./CenteredModalDetailedCookieBanner";
import { CenteredModalTabsCookieBanner } from "./CenteredModalTabsCookieBanner";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CookieBannerPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.cookieBanner;

  const examples: UIExample[] = [
    {
      id: "cookie-banner-1",
      title: t.cookieBanner1TabTitle,
      description: t.cookieBanner1TabDescription,
      render: () => <BottomBarMinimalCookieBanner />,
    },
    {
      id: "cookie-banner-2",
      title: t.cookieBanner2TabTitle,
      description: t.cookieBanner2TabDescription,
      render: () => <BottomBarPolicyLinkCookieBanner />,
    },
    {
      id: "cookie-banner-3",
      title: t.cookieBanner3TabTitle,
      description: t.cookieBanner3TabDescription,
      render: () => <BottomBarIconCookieBanner />,
    },
    {
      id: "cookie-banner-4",
      title: t.cookieBanner4TabTitle,
      description: t.cookieBanner4TabDescription,
      render: () => <CornerCardBottomLeftCookieBanner />,
    },
    {
      id: "cookie-banner-5",
      title: t.cookieBanner5TabTitle,
      description: t.cookieBanner5TabDescription,
      render: () => <CornerCardDismissCookieBanner />,
    },
    {
      id: "cookie-banner-6",
      title: t.cookieBanner6TabTitle,
      description: t.cookieBanner6TabDescription,
      render: () => <CornerCardBottomRightCookieBanner />,
    },
    {
      id: "cookie-banner-7",
      title: t.cookieBanner7TabTitle,
      description: t.cookieBanner7TabDescription,
      render: () => <CornerCardLinkDrawerCookieBanner />,
    },
    {
      id: "cookie-banner-8",
      title: t.cookieBanner8TabTitle,
      description: t.cookieBanner8TabDescription,
      render: () => <ExpandingBottomPanelCookieBanner />,
    },
    {
      id: "cookie-banner-9",
      title: t.cookieBanner9TabTitle,
      description: t.cookieBanner9TabDescription,
      render: () => <BottomBarDialogCookieBanner />,
    },
    {
      id: "cookie-banner-10",
      title: t.cookieBanner10TabTitle,
      description: t.cookieBanner10TabDescription,
      render: () => <CornerCardCheckboxExpandCookieBanner />,
    },
    {
      id: "cookie-banner-11",
      title: t.cookieBanner11TabTitle,
      description: t.cookieBanner11TabDescription,
      render: () => <CornerCardDialogCookieBanner />,
    },
    {
      id: "cookie-banner-12",
      title: t.cookieBanner12TabTitle,
      description: t.cookieBanner12TabDescription,
      render: () => <CornerCardAccordionCookieBanner />,
    },
    {
      id: "cookie-banner-13",
      title: t.cookieBanner13TabTitle,
      description: t.cookieBanner13TabDescription,
      render: () => <CornerCardSheetCookieBanner />,
    },
    {
      id: "cookie-banner-14",
      title: t.cookieBanner14TabTitle,
      description: t.cookieBanner14TabDescription,
      render: () => <FullWidthSwitchPanelCookieBanner />,
    },
    {
      id: "cookie-banner-15",
      title: t.cookieBanner15TabTitle,
      description: t.cookieBanner15TabDescription,
      render: () => <CategoryTilesPanelCookieBanner />,
    },
    {
      id: "cookie-banner-16",
      title: t.cookieBanner16TabTitle,
      description: t.cookieBanner16TabDescription,
      render: () => <SplitPresetPanelCookieBanner />,
    },
    {
      id: "cookie-banner-17",
      title: t.cookieBanner17TabTitle,
      description: t.cookieBanner17TabDescription,
      render: () => <CenteredModalSimpleCookieBanner />,
    },
    {
      id: "cookie-banner-18",
      title: t.cookieBanner18TabTitle,
      description: t.cookieBanner18TabDescription,
      render: () => <CenteredModalDetailedCookieBanner />,
    },
    {
      id: "cookie-banner-19",
      title: t.cookieBanner19TabTitle,
      description: t.cookieBanner19TabDescription,
      render: () => <CenteredModalTabsCookieBanner />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.cookieBannerTitle}
      intro={m.examples.cookieBannerDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="cookie-banner"
    />
  );
}
