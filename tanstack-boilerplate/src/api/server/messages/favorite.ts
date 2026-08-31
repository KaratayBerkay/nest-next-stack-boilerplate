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
  const res = await apiFetch(
    favorite ? MESSAGES_FAVORITE_URL : MESSAGES_UNFAVORITE_URL,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ peerId }),
    },
  );
  // apiFetch never throws on a non-2xx response — toggleFavorite's rollback
  // on failure never ran without this, silently desyncing the star from
  // actual server state.
  if (!res.ok) throw new Error("Failed to update favorite");
}
