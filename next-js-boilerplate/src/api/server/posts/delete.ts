import { apiFetch } from "@/lib/api-client";
import { POSTS_PREFIX } from "@/constants/api/urls";
import { DELETE } from "@/constants/api/methods";

export async function deletePostServer(id: string): Promise<void> {
  const res = await apiFetch(POSTS_PREFIX + id, { method: DELETE });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete post");
  }
}
