"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { RatingBreakdownListReviews } from "./RatingBreakdownListReviews";
import { SpotlightSwitcherReviews } from "./SpotlightSwitcherReviews";
import { PhotoMasonryWallReviews } from "./PhotoMasonryWallReviews";
import { FilterByStarReviews } from "./FilterByStarReviews";
import { ReviewCarouselReviews } from "./ReviewCarouselReviews";
import { VideoTestimonialGridReviews } from "./VideoTestimonialGridReviews";
import { MarqueeStripReviews } from "./MarqueeStripReviews";
import { SortableRatingBarsReviews } from "./SortableRatingBarsReviews";
import { SubmitAndBrowseReviews } from "./SubmitAndBrowseReviews";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ReviewsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.reviews;

  const examples: UIExample[] = [
    {
      id: "reviews-1",
      title: t.reviews1TabTitle,
      description: t.reviews1TabDescription,
      render: () => <RatingBreakdownListReviews />,
    },
    {
      id: "reviews-2",
      title: t.reviews2TabTitle,
      description: t.reviews2TabDescription,
      render: () => <SpotlightSwitcherReviews />,
    },
    {
      id: "reviews-3",
      title: t.reviews3TabTitle,
      description: t.reviews3TabDescription,
      render: () => <PhotoMasonryWallReviews />,
    },
    {
      id: "reviews-4",
      title: t.reviews4TabTitle,
      description: t.reviews4TabDescription,
      render: () => <FilterByStarReviews />,
    },
    {
      id: "reviews-5",
      title: t.reviews5TabTitle,
      description: t.reviews5TabDescription,
      render: () => <ReviewCarouselReviews />,
    },
    {
      id: "reviews-6",
      title: t.reviews6TabTitle,
      description: t.reviews6TabDescription,
      render: () => <VideoTestimonialGridReviews />,
    },
    {
      id: "reviews-7",
      title: t.reviews7TabTitle,
      description: t.reviews7TabDescription,
      render: () => <MarqueeStripReviews />,
    },
    {
      id: "reviews-8",
      title: t.reviews8TabTitle,
      description: t.reviews8TabDescription,
      render: () => <SortableRatingBarsReviews />,
    },
    {
      id: "reviews-9",
      title: t.reviews9TabTitle,
      description: t.reviews9TabDescription,
      render: () => <SubmitAndBrowseReviews />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.reviewsTitle}
      intro={m.examples.reviewsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="reviews"
    />
  );
}
