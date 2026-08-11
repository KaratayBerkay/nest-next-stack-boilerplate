"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { WithFilteredGrid } from "./WithFilteredGrid";
import { WithLabeledGrid } from "./WithLabeledGrid";
import { WithAvatarGrid } from "./WithAvatarGrid";
import { WithLargeGrid } from "./WithLargeGrid";
import { WithBylineFirstGrid } from "./WithBylineFirstGrid";
import { WithCenteredCards } from "./WithCenteredCards";
import { WithOffsetRows } from "./WithOffsetRows";
import { WithStickyIntro } from "./WithStickyIntro";
import { WithReadTimeCards } from "./WithReadTimeCards";
import { WithCategoryOverlayGrid } from "./WithCategoryOverlayGrid";
import { WithFeaturedAndPopular } from "./WithFeaturedAndPopular";
import { WithTeamBrandingRow } from "./WithTeamBrandingRow";
import { WithSidebarFilters } from "./WithSidebarFilters";
import { WithRelatedGrid } from "./WithRelatedGrid";
import { WithCarouselSlides } from "./WithCarouselSlides";
import { WithFeaturedSecondaryStrip } from "./WithFeaturedSecondaryStrip";
import { WithStackedCards } from "./WithStackedCards";
import { WithHorizontalThumbCards } from "./WithHorizontalThumbCards";
import { WithMagazineSplit } from "./WithMagazineSplit";
import { WithSpotlightBandGrid } from "./WithSpotlightBandGrid";
import { WithLeadTileGrid } from "./WithLeadTileGrid";
import { WithTagList } from "./WithTagList";
import { WithSquareArtRows } from "./WithSquareArtRows";
import { WithAnimatedGrid } from "./WithAnimatedGrid";
import { WithTwoColumnGrid } from "./WithTwoColumnGrid";
import { WithCompactFourColumn } from "./WithCompactFourColumn";
import { WithBorderedFourColumn } from "./WithBorderedFourColumn";
import { WithAlternatingDividers } from "./WithAlternatingDividers";
import { WithMetadataRows } from "./WithMetadataRows";
import { WithFilteredRowsSidebar } from "./WithFilteredRowsSidebar";
import { WithHeroThreeCards } from "./WithHeroThreeCards";
import { WithMiniPostStack } from "./WithMiniPostStack";
import { WithSingleFeaturedRow } from "./WithSingleFeaturedRow";
import { WithThreeCardCarousel } from "./WithThreeCardCarousel";
import { WithFullBleedCarousel } from "./WithFullBleedCarousel";
import { WithSplitSideCarousel } from "./WithSplitSideCarousel";
import { WithTimelineFeed } from "./WithTimelineFeed";
import { WithTextOnlyIndex } from "./WithTextOnlyIndex";
import { WithNewsletterPhotoGrid } from "./WithNewsletterPhotoGrid";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function BlogPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.blog;

  const examples: UIExample[] = [
    {
      id: "blog-1",
      title: t.blog1TabTitle,
      description: t.blog1TabDescription,
      render: () => <WithFilteredGrid />,
    },
    {
      id: "blog-3",
      title: t.blog3TabTitle,
      description: t.blog3TabDescription,
      render: () => <WithLabeledGrid />,
    },
    {
      id: "blog-4",
      title: t.blog4TabTitle,
      description: t.blog4TabDescription,
      render: () => <WithAvatarGrid />,
    },
    {
      id: "blog-5",
      title: t.blog5TabTitle,
      description: t.blog5TabDescription,
      render: () => <WithLargeGrid />,
    },
    {
      id: "blog-6",
      title: t.blog6TabTitle,
      description: t.blog6TabDescription,
      render: () => <WithBylineFirstGrid />,
    },
    {
      id: "blog-7",
      title: t.blog7TabTitle,
      description: t.blog7TabDescription,
      render: () => <WithCenteredCards />,
    },
    {
      id: "blog-8",
      title: t.blog8TabTitle,
      description: t.blog8TabDescription,
      render: () => <WithOffsetRows />,
    },
    {
      id: "blog-11",
      title: t.blog11TabTitle,
      description: t.blog11TabDescription,
      render: () => <WithStickyIntro />,
    },
    {
      id: "blog-12",
      title: t.blog12TabTitle,
      description: t.blog12TabDescription,
      render: () => <WithReadTimeCards />,
    },
    {
      id: "blog-13",
      title: t.blog13TabTitle,
      description: t.blog13TabDescription,
      render: () => <WithCategoryOverlayGrid />,
    },
    {
      id: "blog-14",
      title: t.blog14TabTitle,
      description: t.blog14TabDescription,
      render: () => <WithFeaturedAndPopular />,
    },
    {
      id: "blog-16",
      title: t.blog16TabTitle,
      description: t.blog16TabDescription,
      render: () => <WithTeamBrandingRow />,
    },
    {
      id: "blog-17",
      title: t.blog17TabTitle,
      description: t.blog17TabDescription,
      render: () => <WithSidebarFilters />,
    },
    {
      id: "blog-19",
      title: t.blog19TabTitle,
      description: t.blog19TabDescription,
      render: () => <WithRelatedGrid />,
    },
    {
      id: "blog-21",
      title: t.blog21TabTitle,
      description: t.blog21TabDescription,
      render: () => <WithCarouselSlides />,
    },
    {
      id: "blog-22",
      title: t.blog22TabTitle,
      description: t.blog22TabDescription,
      render: () => <WithFeaturedSecondaryStrip />,
    },
    {
      id: "blog-23",
      title: t.blog23TabTitle,
      description: t.blog23TabDescription,
      render: () => <WithStackedCards />,
    },
    {
      id: "blog-24",
      title: t.blog24TabTitle,
      description: t.blog24TabDescription,
      render: () => <WithHorizontalThumbCards />,
    },
    {
      id: "blog-26",
      title: t.blog26TabTitle,
      description: t.blog26TabDescription,
      render: () => <WithMagazineSplit />,
    },
    {
      id: "blog-27",
      title: t.blog27TabTitle,
      description: t.blog27TabDescription,
      render: () => <WithSpotlightBandGrid />,
    },
    {
      id: "blog-28",
      title: t.blog28TabTitle,
      description: t.blog28TabDescription,
      render: () => <WithLeadTileGrid />,
    },
    {
      id: "blog-29",
      title: t.blog29TabTitle,
      description: t.blog29TabDescription,
      render: () => <WithTagList />,
    },
    {
      id: "blog-30",
      title: t.blog30TabTitle,
      description: t.blog30TabDescription,
      render: () => <WithSquareArtRows />,
    },
    {
      id: "blog-31",
      title: t.blog31TabTitle,
      description: t.blog31TabDescription,
      render: () => <WithAnimatedGrid />,
    },
    {
      id: "blog-32",
      title: t.blog32TabTitle,
      description: t.blog32TabDescription,
      render: () => <WithTwoColumnGrid />,
    },
    {
      id: "blog-33",
      title: t.blog33TabTitle,
      description: t.blog33TabDescription,
      render: () => <WithCompactFourColumn />,
    },
    {
      id: "blog-34",
      title: t.blog34TabTitle,
      description: t.blog34TabDescription,
      render: () => <WithBorderedFourColumn />,
    },
    {
      id: "blog-35",
      title: t.blog35TabTitle,
      description: t.blog35TabDescription,
      render: () => <WithAlternatingDividers />,
    },
    {
      id: "blog-36",
      title: t.blog36TabTitle,
      description: t.blog36TabDescription,
      render: () => <WithMetadataRows />,
    },
    {
      id: "blog-37",
      title: t.blog37TabTitle,
      description: t.blog37TabDescription,
      render: () => <WithFilteredRowsSidebar />,
    },
    {
      id: "blog-38",
      title: t.blog38TabTitle,
      description: t.blog38TabDescription,
      render: () => <WithHeroThreeCards />,
    },
    {
      id: "blog-39",
      title: t.blog39TabTitle,
      description: t.blog39TabDescription,
      render: () => <WithMiniPostStack />,
    },
    {
      id: "blog-40",
      title: t.blog40TabTitle,
      description: t.blog40TabDescription,
      render: () => <WithSingleFeaturedRow />,
    },
    {
      id: "blog-41",
      title: t.blog41TabTitle,
      description: t.blog41TabDescription,
      render: () => <WithThreeCardCarousel />,
    },
    {
      id: "blog-42",
      title: t.blog42TabTitle,
      description: t.blog42TabDescription,
      render: () => <WithFullBleedCarousel />,
    },
    {
      id: "blog-43",
      title: t.blog43TabTitle,
      description: t.blog43TabDescription,
      render: () => <WithSplitSideCarousel />,
    },
    {
      id: "blog-44",
      title: t.blog44TabTitle,
      description: t.blog44TabDescription,
      render: () => <WithTimelineFeed />,
    },
    {
      id: "blog-45",
      title: t.blog45TabTitle,
      description: t.blog45TabDescription,
      render: () => <WithTextOnlyIndex />,
    },
    {
      id: "blog-46",
      title: t.blog46TabTitle,
      description: t.blog46TabDescription,
      render: () => <WithNewsletterPhotoGrid />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.blogTitle}
      intro={m.examples.blogDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
