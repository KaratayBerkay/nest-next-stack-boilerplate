import { apiFetchJson } from "@/lib/api-client";
import { AUTH_UNDO_PASSWORD_CHANGE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface UndoPasswordChangeResult {
  ok: boolean;
}

export async function undoPasswordChangeServer(
  token: string,
): Promise<UndoPasswordChangeResult> {
  return apiFetchJson<UndoPasswordChangeResult>(AUTH_UNDO_PASSWORD_CHANGE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ token }),
  });
}
