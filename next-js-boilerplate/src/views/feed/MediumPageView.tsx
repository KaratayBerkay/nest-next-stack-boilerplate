"use client";

import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/MediumFeedList";

export function MediumPageView() {
  return (
    <FeedBaseView
      showSidebar
      renderFeedList={(search) => <FeedList key={search} search={search} />}
    />
  );
}
