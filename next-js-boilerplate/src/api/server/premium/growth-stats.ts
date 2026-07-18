import { apiFetch } from "@/lib/api-client";
import { GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface GrowthStats {
  totalUsers: number;
  newUsersLast7Days: number;
  totalPosts: number;
  totalFriendships: number;
}

export async function fetchGrowthStatsServer(): Promise<GrowthStats | null> {
  const res = await apiFetch(GQL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      query: `query { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.growthStats ?? null;
}
