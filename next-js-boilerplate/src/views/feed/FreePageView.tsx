"use client";

import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/FreeFeedList";

import type { FeedListProps } from "@/types/feed/FeedList-types";

export function FreePageView({
  initialFeedData: _initialFeedData,
}: {
  initialFeedData?: FeedListProps["initialFeedData"];
}) {
  return (
    <FeedBaseView
      showPageInfo
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
