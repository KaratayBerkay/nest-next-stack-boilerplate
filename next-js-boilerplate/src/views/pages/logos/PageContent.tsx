"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { TrustedByGridLogos } from "./TrustedByGridLogos";
import { InfiniteMarqueeStripLogos } from "./InfiniteMarqueeStripLogos";
import { GrayscaleHoverGridLogos } from "./GrayscaleHoverGridLogos";
import { StatCalloutLogos } from "./StatCalloutLogos";
import { IndustryTabsLogos } from "./IndustryTabsLogos";
import { TestimonialQuoteLogos } from "./TestimonialQuoteLogos";
import { BorderedSpotlightGridLogos } from "./BorderedSpotlightGridLogos";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function LogosPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.logos;

  const examples: UIExample[] = [
    {
      id: "logos-1",
      title: t.logos1TabTitle,
      description: t.logos1TabDescription,
      render: () => <TrustedByGridLogos />,
    },
    {
      id: "logos-2",
      title: t.logos2TabTitle,
      description: t.logos2TabDescription,
      render: () => <InfiniteMarqueeStripLogos />,
    },
    {
      id: "logos-3",
      title: t.logos3TabTitle,
      description: t.logos3TabDescription,
      render: () => <GrayscaleHoverGridLogos />,
    },
    {
      id: "logos-4",
      title: t.logos4TabTitle,
      description: t.logos4TabDescription,
      render: () => <StatCalloutLogos />,
    },
    {
      id: "logos-5",
      title: t.logos5TabTitle,
      description: t.logos5TabDescription,
      render: () => <IndustryTabsLogos />,
    },
    {
      id: "logos-6",
      title: t.logos6TabTitle,
      description: t.logos6TabDescription,
      render: () => <TestimonialQuoteLogos />,
    },
    {
      id: "logos-7",
      title: t.logos7TabTitle,
      description: t.logos7TabDescription,
      render: () => <BorderedSpotlightGridLogos />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.logosTitle}
      intro={m.examples.logosDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="logos"
    />
  );
}
