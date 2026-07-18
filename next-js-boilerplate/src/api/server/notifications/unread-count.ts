import { apiFetch } from "@/lib/api-client";
import { NOTIFICATIONS_UNREAD_COUNT_URL } from "@/constants/api/urls";

export async function fetchUnreadNotificationCountServer(): Promise<number> {
  const res = await apiFetch(NOTIFICATIONS_UNREAD_COUNT_URL);
  if (!res.ok) throw new Error("Failed to fetch unread count");
  const data = await res.json();
  return typeof data === "number" ? data : (data.count ?? 0);
}
