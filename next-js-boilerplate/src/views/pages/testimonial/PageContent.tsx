"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredPullQuoteHeroTestimonial } from "./CenteredPullQuoteHeroTestimonial";
import { ColumnQuoteGridTestimonial } from "./ColumnQuoteGridTestimonial";
import { RotatingQuoteCarouselTestimonial } from "./RotatingQuoteCarouselTestimonial";
import { VideoQuoteSpotlightTestimonial } from "./VideoQuoteSpotlightTestimonial";
import { SplitImageQuoteTestimonial } from "./SplitImageQuoteTestimonial";
import { QuoteMarqueeStripTestimonial } from "./QuoteMarqueeStripTestimonial";
import { LogoBadgeQuoteWallTestimonial } from "./LogoBadgeQuoteWallTestimonial";
import { ResultsStatQuoteTestimonial } from "./ResultsStatQuoteTestimonial";
import { ExpandableQuoteAccordionTestimonial } from "./ExpandableQuoteAccordionTestimonial";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

export default function TestimonialPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithTestimonialMessages & {
    examples: {
      testimonialTitle: string;
      testimonialDescription: string;
    };
  };
  const t = m.testimonial;

  const examples: UIExample[] = [
    {
      id: "testimonial-1",
      title: t.testimonial1TabTitle,
      description: t.testimonial1TabDescription,
      render: () => <CenteredPullQuoteHeroTestimonial />,
    },
    {
      id: "testimonial-2",
      title: t.testimonial2TabTitle,
      description: t.testimonial2TabDescription,
      render: () => <ColumnQuoteGridTestimonial />,
    },
    {
      id: "testimonial-3",
      title: t.testimonial3TabTitle,
      description: t.testimonial3TabDescription,
      render: () => <RotatingQuoteCarouselTestimonial />,
    },
    {
      id: "testimonial-4",
      title: t.testimonial4TabTitle,
      description: t.testimonial4TabDescription,
      render: () => <VideoQuoteSpotlightTestimonial />,
    },
    {
      id: "testimonial-5",
      title: t.testimonial5TabTitle,
      description: t.testimonial5TabDescription,
      render: () => <SplitImageQuoteTestimonial />,
    },
    {
      id: "testimonial-6",
      title: t.testimonial6TabTitle,
      description: t.testimonial6TabDescription,
      render: () => <QuoteMarqueeStripTestimonial />,
    },
    {
      id: "testimonial-7",
      title: t.testimonial7TabTitle,
      description: t.testimonial7TabDescription,
      render: () => <LogoBadgeQuoteWallTestimonial />,
    },
    {
      id: "testimonial-8",
      title: t.testimonial8TabTitle,
      description: t.testimonial8TabDescription,
      render: () => <ResultsStatQuoteTestimonial />,
    },
    {
      id: "testimonial-9",
      title: t.testimonial9TabTitle,
      description: t.testimonial9TabDescription,
      render: () => <ExpandableQuoteAccordionTestimonial />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.testimonialTitle}
      intro={m.examples.testimonialDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="testimonial"
    />
  );
}
