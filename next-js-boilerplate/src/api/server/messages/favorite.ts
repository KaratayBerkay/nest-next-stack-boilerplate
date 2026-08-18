import { apiFetch } from "@/lib/api-client";
import {
  MESSAGES_FAVORITE_URL,
  MESSAGES_UNFAVORITE_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function setFavoriteServer(
  peerId: string,
  favorite: boolean,
): Promise<void> {
  await apiFetch(favorite ? MESSAGES_FAVORITE_URL : MESSAGES_UNFAVORITE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ peerId }),
  });
}
