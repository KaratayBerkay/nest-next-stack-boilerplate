"use client";

import { useEffect, useState, useCallback, useRef, useMemo, type Dispatch, type SetStateAction } from "react";
import type { FeedListProps } from "@/types/feed/FeedList-types";
import type { Post } from "@/types/feed/PostCard-types";
import Link from "next/link";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/PostCard";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { apiFetch } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const PAGE_SIZE = 5;

function handleToggleComments(postId: string, setExpandedPostId: Dispatch<SetStateAction<string | null>>) {
  setExpandedPostId((prev) => (prev === postId ? null : postId));
}

function handleDeletePost(postId: string, setExtraPosts: Dispatch<SetStateAction<Post[]>>, setExpandedPostId: Dispatch<SetStateAction<string | null>>) {
  setExtraPosts((prev) => prev.filter((p) => p.id !== postId));
  setExpandedPostId((prev) => (prev === postId ? null : prev));
}

export function FeedList({ search }: FeedListProps) {
  const t = useMessages("feed");
  const queryClient = useQueryClient();
  const realtime = useRealtime();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    realtime?.watch("feed");
    return () => realtime?.unwatch("feed");
  }, [realtime]);
  useEffect(() => {
    queryClient.setQueryData(["feed", "new-flag"], false);
  }, [queryClient]);
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [extraHasMore, setExtraHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useYSwipeGesture<HTMLDivElement>();

  const { data } = useSuspenseQuery<{
    posts: Post[];
    hasMore: boolean;
    nextCursor: string | null;
  }>({
    queryKey: ["feed", "list", search],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.set("take", String(PAGE_SIZE));
      if (search) p.set("search", search);
      const res = await apiFetch(`/api/posts?${p}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? t.failedToLoadPosts);
      }
      return res.json();
    },
  });

  const posts = useMemo(
    () => [...(data?.posts ?? []), ...extraPosts],
    [data?.posts, extraPosts],
  );
  const hasMore = extraPosts.length > 0 ? extraHasMore : (data?.hasMore ?? false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !cursorRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const p = new URLSearchParams();
      p.set("take", String(PAGE_SIZE));
      p.set("cursor", cursorRef.current);
      if (search) p.set("search", search);
      const res = await apiFetch(`/api/posts?${p}`);
      if (!res.ok) return;
      const result = await res.json();
      setExtraPosts((prev) => [...prev, ...result.posts]);
      setExtraHasMore(result.hasMore);
      cursorRef.current = result.nextCursor;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [hasMore, search]);

  useEffect(() => {
    cursorRef.current = data?.nextCursor ?? null;
  }, [data?.nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const hash = typeof window !== "undefined" ? window.location.hash : "";
  useEffect(() => {
    if (!hash.startsWith("#post-")) return;
    const id = hash.replace("#post-", "");
    let timer: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const tryScroll = () => {
      const el = document.getElementById(`post-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      }
      return false;
    };
    if (!tryScroll()) {
      timer = setInterval(() => {
        if (tryScroll()) {
          if (timer) clearInterval(timer);
          if (timeout) clearTimeout(timeout);
        }
      }, 200);
      timeout = setTimeout(() => {
        if (timer) clearInterval(timer);
      }, 5000);
      return () => {
        if (timer) clearInterval(timer);
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [hash]);

  const newFlag = useQuery<boolean>({
    queryKey: ["feed", "new-flag"],
    queryFn: () => false,
    staleTime: Infinity,
  }).data;

  const handleRefresh = useCallback(() => {
    queryClient.setQueryData(["feed", "new-flag"], false);
    setExtraPosts([]);
    setExtraHasMore(true);
    queryClient.invalidateQueries({ queryKey: ["feed", "list", search] });
  }, [queryClient, search]);

  useEffect(() => {
    if (newFlag && posts.length > 0) {
      const id = setTimeout(() => handleRefresh(), 0);
      return () => clearTimeout(id);
    }
  }, [newFlag, posts.length, handleRefresh]);

  return (
    <div
      ref={scrollRef}
      className="flex max-h-[calc(100dvh-8rem)] flex-col gap-3 overflow-y-auto px-1 pb-4"
    >

      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-sm text-muted">{t.noPostsYet}</p>
          <Link
            href="/v1/en/share"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            {t.beFirstToShare}
          </Link>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isExpanded={expandedPostId === post.id}
            onToggle={() => handleToggleComments(post.id, setExpandedPostId)}
            onDelete={(postId) => handleDeletePost(postId, setExtraPosts, setExpandedPostId)}
        />
      ))}

      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <p className="text-[10px] text-muted">{t.loadingMore}</p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-4 text-center text-[10px] text-muted">{t.allCaughtUp}</p>
      )}
    </div>
  );
}
