import { apiFetch } from "@/lib/api-client";
import { POSTS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function createPostServer(title: string, content: string, imageUrl?: string): Promise<void> {
  const res = await apiFetch(POSTS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ title, content, imageUrl }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create post");
  }
}
