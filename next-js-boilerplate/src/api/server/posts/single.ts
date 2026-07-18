import { apiFetch } from "@/lib/api-client";
import { POSTS_PREFIX } from "@/constants/api/urls";

export interface SinglePost {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  comments?: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string; email: string };
    reactions?: Array<{ id: string; type: string; userId: string }>;
    parentId?: string | null;
    _count?: { replies: number };
  }>;
  reactions?: Array<{ id: string; type: string; userId: string }>;
  reactionBreakdown?: Array<{ type: string; count: number }>;
  whoReacted?: Array<{ userId: string; name?: string; type: string }>;
  _count?: { comments: number; reactions: number };
}

export async function fetchSinglePostServer(uuid: string): Promise<SinglePost> {
  const res = await apiFetch(POSTS_PREFIX + uuid);
  if (!res.ok) throw new Error("Post not found");
  const data = await res.json();
  if (!data.post) throw new Error("Post not found");
  return data.post as SinglePost;
}
