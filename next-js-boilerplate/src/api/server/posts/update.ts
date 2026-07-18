import { apiFetch } from "@/lib/api-client";
import { POSTS_PREFIX } from "@/constants/api/urls";
import { PUT } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function updatePostServer(id: string, title: string, content: string): Promise<void> {
  const res = await apiFetch(POSTS_PREFIX + id, {
    method: PUT,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update post");
  }
}
