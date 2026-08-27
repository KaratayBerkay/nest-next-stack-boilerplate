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

export async function fetchGrowthStatsServer(): Promise<GrowthStats> {
  const res = await apiFetch(GQL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      query: `query { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch growth stats");
  const data = await res.json();
  // A GraphQL error rides inside a 200 response, so `res.ok` alone doesn't
  // catch it — this previously fell through to `?? null`, which the caller
  // (loadPremiumGrowthStats) couldn't distinguish from "loading", leaving the
  // skeleton spinner up forever with no error toast.
  if (data.errors || !data.data?.growthStats) {
    throw new Error("Failed to fetch growth stats");
  }
  return data.data.growthStats;
}
