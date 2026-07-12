"use client";

import { PostDetailBaseView } from "./PostDetailBaseView";

export function MediumPageView({
  initialPostData: _initialPostData,
}: {
  initialPostData?: unknown;
}) {
  return (
    <PostDetailBaseView
      showReactionBreakdown
      initialPostData={_initialPostData}
    />
  );
}
