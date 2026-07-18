import { apiFetch } from "@/lib/api-client";
import { SESSIONS_REVOKE_OTHERS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function revokeAllOtherSessionsServer(): Promise<void> {
  await apiFetch(SESSIONS_REVOKE_OTHERS_URL, { method: POST });
}
