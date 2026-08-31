import { apiFetch } from "@/lib/api-client";
import { ADMIN_SEARCH_USERS_URL } from "@/constants/api/urls";

export interface AdminUserResult {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  subscriptionTier: string;
}

export async function searchAdminUsersServer(
  q: string,
): Promise<AdminUserResult[]> {
  const res = await apiFetch(
    `${ADMIN_SEARCH_USERS_URL}?q=${encodeURIComponent(q)}&take=20`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}
