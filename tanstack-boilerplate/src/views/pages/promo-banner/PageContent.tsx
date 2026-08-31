"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { FreeShippingProgressPromoBanner } from "./FreeShippingProgressPromoBanner";
import { TwoToneSplitShopNowPromoBanner } from "./TwoToneSplitShopNowPromoBanner";
import { DeliveryCutoffCountdownPromoBanner } from "./DeliveryCutoffCountdownPromoBanner";
import { TrustSignalMinimalPromoBanner } from "./TrustSignalMinimalPromoBanner";
import { FlashSaleGradientCountdownPromoBanner } from "./FlashSaleGradientCountdownPromoBanner";
import { HolidayMarqueeCountdownPromoBanner } from "./HolidayMarqueeCountdownPromoBanner";
import { StickyBottomStockBarPromoBanner } from "./StickyBottomStockBarPromoBanner";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function PromoBannerPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.promoBanner;

  const examples: UIExample[] = [
    {
      id: "promo-banner-1",
      title: t.promoBanner1TabTitle,
      description: t.promoBanner1TabDescription,
      render: () => <FreeShippingProgressPromoBanner />,
    },
    {
      id: "promo-banner-2",
      title: t.promoBanner2TabTitle,
      description: t.promoBanner2TabDescription,
      render: () => <TwoToneSplitShopNowPromoBanner />,
    },
    {
      id: "promo-banner-3",
      title: t.promoBanner3TabTitle,
      description: t.promoBanner3TabDescription,
      render: () => <DeliveryCutoffCountdownPromoBanner />,
    },
    {
      id: "promo-banner-4",
      title: t.promoBanner4TabTitle,
      description: t.promoBanner4TabDescription,
      render: () => <TrustSignalMinimalPromoBanner />,
    },
    {
      id: "promo-banner-5",
      title: t.promoBanner5TabTitle,
      description: t.promoBanner5TabDescription,
      render: () => <FlashSaleGradientCountdownPromoBanner />,
    },
    {
      id: "promo-banner-6",
      title: t.promoBanner6TabTitle,
      description: t.promoBanner6TabDescription,
      render: () => <HolidayMarqueeCountdownPromoBanner />,
    },
    {
      id: "promo-banner-7",
      title: t.promoBanner7TabTitle,
      description: t.promoBanner7TabDescription,
      render: () => <StickyBottomStockBarPromoBanner />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.promoBannerTitle}
      intro={m.examples.promoBannerDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="promo-banner"
    />
  );
}
