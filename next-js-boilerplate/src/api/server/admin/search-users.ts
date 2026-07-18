import { apiFetch } from "@/lib/api-client";
import { USERS_SEARCH_PREFIX } from "@/constants/api/urls";

export interface AdminUserResult {
  id: string;
  name: string;
  email: string;
}

export async function searchAdminUsersServer(q: string): Promise<AdminUserResult[]> {
  const res = await apiFetch(
    `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(q)}&take=20`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}
