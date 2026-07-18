import { apiFetch } from "@/lib/api-client";
import { MESSAGES_UNREAD_COUNT_URL } from "@/constants/api/urls";

export async function fetchDmUnreadCountServer(): Promise<number> {
  const res = await apiFetch(MESSAGES_UNREAD_COUNT_URL);
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.count === "number" ? data.count : 0;
}
