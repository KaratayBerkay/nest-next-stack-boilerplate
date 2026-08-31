"use client";

import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { Post } from "@/types/feed/PostCard-types";
import { fetchFeedListServer } from "@/api/server/posts/list";
import { useQueryClient } from "@tanstack/react-query";

export const PAGE_SIZE = 5;

// Deleting a post that's on page 1 (data.posts) triggers a broad ["feed"]
// invalidation; the refetched page 1 then shifts a post that was already
// sitting in extraPosts (from a prior "load more") into its place — without
// deduping, that post rendered twice, once from each array.
export function mergeFeedPosts(pagePosts: Post[], extraPosts: Post[]): Post[] {
  const seen = new Set<string>();
  const merged: Post[] = [];
  for (const p of [...pagePosts, ...extraPosts]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    merged.push(p);
  }
  return merged;
}

export function handleToggleComments(
  postId: string,
  setExpandedPostId: Dispatch<SetStateAction<string | null>>,
) {
  setExpandedPostId((prev) => (prev === postId ? null : postId));
}

export function handleDeletePost(
  postId: string,
  setExtraPosts: Dispatch<SetStateAction<Post[]>>,
  setExpandedPostId: Dispatch<SetStateAction<string | null>>,
) {
  setExtraPosts((prev) => prev.filter((p) => p.id !== postId));
  setExpandedPostId((prev) => (prev === postId ? null : prev));
}

export async function handleLoadMore(
  loadingRef: MutableRefObject<boolean>,
  hasMore: boolean,
  cursorRef: MutableRefObject<string | null>,
  search: string,
  setLoadingMore: Dispatch<SetStateAction<boolean>>,
  setExtraPosts: Dispatch<SetStateAction<Post[]>>,
  setExtraHasMore: Dispatch<SetStateAction<boolean>>,
) {
  if (loadingRef.current || !hasMore || !cursorRef.current) return;
  loadingRef.current = true;
  setLoadingMore(true);
  try {
    const result = await fetchFeedListServer(
      PAGE_SIZE,
      cursorRef.current,
      search,
    );
    setExtraPosts((prev) => [...prev, ...result.posts]);
    setExtraHasMore(result.hasMore);
    cursorRef.current = result.nextCursor;
  } catch {
    // silent
  } finally {
    setLoadingMore(false);
    loadingRef.current = false;
  }
}

export function refreshFeedList(
  queryClient: ReturnType<typeof useQueryClient>,
  setExtraPosts: Dispatch<SetStateAction<Post[]>>,
  setExtraHasMore: Dispatch<SetStateAction<boolean>>,
  search: string,
) {
  queryClient.setQueryData(["feed", "new-flag"], false);
  setExtraPosts([]);
  setExtraHasMore(true);
  queryClient.invalidateQueries({ queryKey: ["feed", "list", search] });
}
