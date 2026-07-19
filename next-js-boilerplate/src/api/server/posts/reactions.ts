import { apiFetch } from "@/lib/api-client";
import { REACTIONS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface ToggleReactionParams {
  type: string;
  postId?: string;
  commentId?: string;
}

export async function toggleReactionServer(
  params: ToggleReactionParams,
): Promise<void> {
  const res = await apiFetch(REACTIONS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to toggle reaction");
  }
}
