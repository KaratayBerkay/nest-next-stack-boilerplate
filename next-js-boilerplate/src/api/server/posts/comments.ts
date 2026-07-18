import { apiFetch } from "@/lib/api-client";
import { COMMENTS_URL, COMMENTS_PREFIX } from "@/constants/api/urls";
import { POST, PUT, DELETE } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function createCommentServer(
  postId: string,
  body: string,
  parentId?: string | null,
): Promise<void> {
  const res = await apiFetch(COMMENTS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ postId, body, parentId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to create comment");
  }
}

export async function updateCommentServer(commentId: string, body: string): Promise<void> {
  const res = await apiFetch(COMMENTS_PREFIX + commentId, {
    method: PUT,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to update comment");
  }
}

export async function deleteCommentServer(commentId: string): Promise<void> {
  const res = await apiFetch(COMMENTS_PREFIX + commentId, { method: DELETE });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to delete comment");
  }
}
