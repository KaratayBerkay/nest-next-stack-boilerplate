"use client";

import { PostDetailBaseView } from "./PostDetailBaseView";

export function PremiumPageView({
  initialPostData: _initialPostData,
}: {
  initialPostData?: unknown;
}) {
  return (
    <PostDetailBaseView
      showReactionBreakdown
      showWhoReacted
      initialPostData={_initialPostData}
    />
  );
}
