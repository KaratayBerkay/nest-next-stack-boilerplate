"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/PostCard";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { apiFetch } from "@/lib/api-client";
import { IconSearch } from "@tabler/icons-react";

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  _count?: { comments: number; reactions: number };
}

const PAGE_SIZE = 5;

function FeedList({ search }: { search: string }) {
  const queryClient = useQueryClient();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [extraHasMore, setExtraHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useYSwipeGesture<HTMLDivElement>();

  const { data, isLoading, error } = useQuery<{
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
        throw new Error(body.error ?? "Failed to load posts");
      }
      return res.json();
    },
    staleTime: 30_000,
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

  const handleToggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const handleDeletePost = (postId: string) => {
    setExtraPosts((prev) => prev.filter((p) => p.id !== postId));
    setExpandedPostId((prev) => (prev === postId ? null : prev));
  };

  const newFlag = useQuery<boolean>({
    queryKey: ["feed", "new-flag"],
    queryFn: () => false,
    staleTime: Infinity,
  }).data;

  const showNewPill = !!newFlag && posts.length > 0;

  const handleLoadNewPosts = () => {
    queryClient.setQueryData(["feed", "new-flag"], false);
    setExtraPosts([]);
    setExtraHasMore(true);
    cursorRef.current = data?.nextCursor ?? null;
    queryClient.invalidateQueries({ queryKey: ["feed", "list", search] });
  };

  return (
    <div
      ref={scrollRef}
      className="flex max-h-[calc(100dvh-8rem)] flex-col gap-3 overflow-y-auto px-1 pb-4"
    >
      {showNewPill && (
        <button
          onClick={handleLoadNewPosts}
          className="bg-brand/10 text-brand mx-auto rounded-full px-4 py-1.5 text-xs font-medium transition-colors hover:bg-brand/20"
        >
          New posts available — tap to load
        </button>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted text-sm">Loading...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-red-500">{String(error.message)}</p>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-muted text-sm">No posts yet.</p>
          <Link
            href="/v1/en/share"
            className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            Be the first to share
          </Link>
        </div>
      )}

      {!isLoading &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isExpanded={expandedPostId === post.id}
            onToggle={() => handleToggleComments(post.id)}
            onDelete={handleDeletePost}
          />
        ))}

      {!isLoading && hasMore && <div ref={sentinelRef} className="h-4" />}

      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <p className="text-muted text-[10px]">Loading more...</p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-muted py-4 text-center text-[10px]">All caught up</p>
      )}
    </div>
  );
}

export default function FeedPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">Feed</h2>
        <Link
          href={`/v1/${lang}/share`}
          className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Share
        </Link>
      </div>

      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="text-muted pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="border-border bg-surface text-fg w-full rounded-lg border py-1.5 pr-3 pl-7 text-xs"
        />
      </div>

      <FeedList key={search} search={search} />
    </div>
  );
}
