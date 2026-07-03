"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

export default function FeedPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useYSwipeGesture<HTMLDivElement>();

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      params.set("take", String(PAGE_SIZE));
      if (cursor) params.set("cursor", cursor);
      if (search) params.set("search", search);

      const res = await apiFetch(`/api/posts?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load posts");
      }
      return res.json() as Promise<{
        posts: Post[];
        hasMore: boolean;
        nextCursor: string | null;
      }>;
    },
    [search],
  );

  useEffect(() => {
    let cancelled = false;
    cursorRef.current = null;
    fetchPosts()
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts);
        setHasMore(data.hasMore);
        cursorRef.current = data.nextCursor;
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(cursorRef.current ?? undefined);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [fetchPosts, hasMore]);

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

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#post-")) return;
    const id = hash.replace("#post-", "");
    const tryScroll = () => {
      const el = document.getElementById(`post-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      }
      return false;
    };
    if (!tryScroll()) {
      const timer = setInterval(() => {
        if (tryScroll()) clearInterval(timer);
      }, 200);
      setTimeout(() => clearInterval(timer), 5000);
    }
  }, [posts]);

  const handleToggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setExpandedPostId((prev) => (prev === postId ? null : prev));
  };

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

      {/* Search */}
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

      <div
        ref={scrollRef}
        className="flex max-h-[calc(100dvh-8rem)] flex-col gap-3 overflow-y-auto px-1 pb-4"
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted text-sm">Loading...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-muted text-sm">No posts yet.</p>
            <Link
              href={`/v1/${lang}/share`}
              className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white"
            >
              Be the first to share
            </Link>
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isExpanded={expandedPostId === post.id}
              onToggle={() => handleToggleComments(post.id)}
              onDelete={handleDeletePost}
            />
          ))}

        {!loading && hasMore && <div ref={sentinelRef} className="h-4" />}

        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <p className="text-muted text-[10px]">Loading more...</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-muted py-4 text-center text-[10px]">
            All caught up
          </p>
        )}
      </div>
    </div>
  );
}
