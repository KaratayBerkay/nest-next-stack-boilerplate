import { apiFetchJson } from "@/lib/api-client";
import { SESSIONS_LIST_URL } from "@/constants/api/urls";

export interface SessionInfo {
  sessionId: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  issuedAt: string;
  expiresAt: string;
}

export async function listSessionsServer(): Promise<SessionInfo[]> {
  const data = await apiFetchJson<{ sessions: SessionInfo[] }>(SESSIONS_LIST_URL);
  return data.sessions;
}
