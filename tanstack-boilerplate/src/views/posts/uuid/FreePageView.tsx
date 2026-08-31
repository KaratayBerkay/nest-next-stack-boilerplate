"use client";

import { PostDetailBaseView } from "./PostDetailBaseView";

export function FreePageView({
  initialPostData: _initialPostData,
}: {
  initialPostData?: unknown;
}) {
  return <PostDetailBaseView showPageInfo initialPostData={_initialPostData} />;
}
