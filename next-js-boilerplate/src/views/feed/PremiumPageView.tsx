"use client";

import type { FeedListPremiumProps } from "@/types/feed/FeedList-types";
import { useAuth } from "@/hooks/useAuth";
import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/PremiumFeedList";

export function PremiumPageView({
  initialFeedData: _initialFeedData,
}: {
  initialFeedData?: FeedListPremiumProps["initialFeedData"];
}) {
  const { user } = useAuth();
  return (
    <FeedBaseView
      showSidebar
      renderFeedList={(search) => (
        <FeedList
          key={search}
          search={search}
          initialFeedData={_initialFeedData}
          currentUserId={user?.id}
        />
      )}
    />
  );
}
