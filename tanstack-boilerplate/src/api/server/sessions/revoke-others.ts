import { apiFetchJson } from "@/lib/api-client";
import { SESSIONS_REVOKE_OTHERS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function revokeAllOtherSessionsServer(): Promise<void> {
  // apiFetch (unlike apiFetchJson) never throws on a non-2xx response — the
  // caller's optimistic "strip every other session from the UI" update ran
  // unconditionally, so a failed revoke (CSRF echo failure, transient 500)
  // showed the user a session list that looked fully cleaned up when nothing
  // on the backend was actually revoked.
  await apiFetchJson(SESSIONS_REVOKE_OTHERS_URL, { method: POST });
}
