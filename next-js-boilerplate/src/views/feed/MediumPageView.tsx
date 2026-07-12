"use client";

import type { FeedListProps } from "@/types/feed/FeedList-types";
import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/MediumFeedList";

export function MediumPageView({
  initialFeedData: _initialFeedData,
}: {
  initialFeedData?: FeedListProps["initialFeedData"];
}) {
  return (
    <FeedBaseView
      showSidebar
      renderFeedList={(search) => (
        <FeedList
          key={search}
          search={search}
          initialFeedData={_initialFeedData}
        />
      )}
    />
  );
}
