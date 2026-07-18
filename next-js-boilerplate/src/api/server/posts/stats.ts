import { apiFetch } from "@/lib/api-client";
import { GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface PostStats {
  totalPosts: number;
  totalReactions: number;
  avgReactionsPerPost: number;
}

export async function fetchPostStatsServer(): Promise<PostStats> {
  const res = await apiFetch(GQL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      query: `query { myPostStats { totalPosts totalReactions avgReactionsPerPost } }`,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to load stats");
  }
  const data = await res.json();
  if (!data.data?.myPostStats) throw new Error("No stats data returned");
  return data.data.myPostStats as PostStats;
}
