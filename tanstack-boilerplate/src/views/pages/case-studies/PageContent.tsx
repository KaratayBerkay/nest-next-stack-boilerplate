"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HoverImageGrid } from "./HoverImageGrid";
import { QuotesMetrics } from "./QuotesMetrics";
import { FeaturedSupportingGrid } from "./FeaturedSupportingGrid";
import { SpotlightStatsCta } from "./SpotlightStatsCta";
import { TestimonialCarouselCase } from "./TestimonialCarouselCase";
import { MaskedLogoCarousel } from "./MaskedLogoCarousel";
import { SteppingThreeUpCarousel } from "./SteppingThreeUpCarousel";
import { TwoUpLandscapeCarousel } from "./TwoUpLandscapeCarousel";
import { MaskedTwoUpCarousel } from "./MaskedTwoUpCarousel";
import { ThreeColumnCenteredGrid } from "./ThreeColumnCenteredGrid";
import { TwoByTwoLandscapeGrid } from "./TwoByTwoLandscapeGrid";
import { MetricCards } from "./MetricCards";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CaseStudiesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.caseStudies;

  const examples: UIExample[] = [
    {
      id: "case-studies-1",
      title: t.caseStudy1TabTitle,
      description: t.caseStudy1TabDescription,
      render: () => <HoverImageGrid />,
    },
    {
      id: "case-studies-2",
      title: t.caseStudy2TabTitle,
      description: t.caseStudy2TabDescription,
      render: () => <QuotesMetrics />,
    },
    {
      id: "case-studies-3",
      title: t.caseStudy3TabTitle,
      description: t.caseStudy3TabDescription,
      render: () => <FeaturedSupportingGrid />,
    },
    {
      id: "case-studies-4",
      title: t.caseStudy4TabTitle,
      description: t.caseStudy4TabDescription,
      render: () => <SpotlightStatsCta />,
    },
    {
      id: "case-studies-5",
      title: t.caseStudy5TabTitle,
      description: t.caseStudy5TabDescription,
      render: () => <TestimonialCarouselCase />,
    },
    {
      id: "case-studies-6",
      title: t.caseStudy6TabTitle,
      description: t.caseStudy6TabDescription,
      render: () => <MaskedLogoCarousel />,
    },
    {
      id: "case-studies-8",
      title: t.caseStudy8TabTitle,
      description: t.caseStudy8TabDescription,
      render: () => <SteppingThreeUpCarousel />,
    },
    {
      id: "case-studies-9",
      title: t.caseStudy9TabTitle,
      description: t.caseStudy9TabDescription,
      render: () => <TwoUpLandscapeCarousel />,
    },
    {
      id: "case-studies-10",
      title: t.caseStudy10TabTitle,
      description: t.caseStudy10TabDescription,
      render: () => <MaskedTwoUpCarousel />,
    },
    {
      id: "case-studies-11",
      title: t.caseStudy11TabTitle,
      description: t.caseStudy11TabDescription,
      render: () => <ThreeColumnCenteredGrid />,
    },
    {
      id: "case-studies-12",
      title: t.caseStudy12TabTitle,
      description: t.caseStudy12TabDescription,
      render: () => <TwoByTwoLandscapeGrid />,
    },
    {
      id: "case-studies-13",
      title: t.caseStudy13TabTitle,
      description: t.caseStudy13TabDescription,
      render: () => <MetricCards />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.caseStudiesTitle}
      intro={m.examples.caseStudiesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="case-studies"
    />
  );
}
