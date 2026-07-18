import { apiFetch } from "@/lib/api-client";
import { POSTS_URL } from "@/constants/api/urls";

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  reactions?: Array<{ id: string; type: string; userId: string }>;
  reactionBreakdown?: Array<{ type: string; count: number }>;
  whoReacted?: Array<{ userId: string; name?: string; type: string }>;
  _count?: { comments: number; reactions: number };
}

export interface FeedListResult {
  posts: FeedPost[];
  hasMore: boolean;
  nextCursor: string | null;
}

export async function fetchFeedListServer(
  take: number,
  cursor?: string | null,
  search?: string,
): Promise<FeedListResult> {
  const p = new URLSearchParams();
  p.set("take", String(take));
  if (cursor) p.set("cursor", cursor);
  if (search) p.set("search", search);

  const res = await apiFetch(`${POSTS_URL}?${p.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to load posts");
  }
  return res.json();
}
