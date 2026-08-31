import { apiFetchJson } from "@/lib/api-client";
import { SESSIONS_LIST_URL } from "@/constants/api/urls";
import type { SessionInfo } from "@/types/settings/SessionInfo-types";

export async function listSessionsServer(): Promise<SessionInfo[]> {
  const data = await apiFetchJson<{ sessions: SessionInfo[] }>(
    SESSIONS_LIST_URL,
  );
  return data.sessions;
}
