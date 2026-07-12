"use client";

import { useAuth } from "@/hooks/useAuth";
import { FeedBaseView } from "@/views/feed/FeedBaseView";
import { FeedList } from "@/views/feed/PremiumFeedList";

export function PremiumPageView() {
  const { user } = useAuth();
  return (
    <FeedBaseView
      showSidebar
      renderFeedList={(search) => (
        <FeedList key={search} search={search} currentUserId={user?.id} />
      )}
    />
  );
}
