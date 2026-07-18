import { apiFetch } from "@/lib/api-client";
import { NOTIFICATIONS_READ_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function markNotificationReadServer(id: string): Promise<void> {
  await apiFetch(NOTIFICATIONS_READ_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ id }),
  });
}

export async function markAllNotificationsReadServer(): Promise<void> {
  await apiFetch(NOTIFICATIONS_READ_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ all: true }),
  });
}
