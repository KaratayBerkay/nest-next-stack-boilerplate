"use client";

import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/FreeFeedList";

export function FreePageView() {
  return (
    <FeedBaseView
      showPageInfo
      renderFeedList={(search) => <FeedList key={search} search={search} />}
    />
  );
}
