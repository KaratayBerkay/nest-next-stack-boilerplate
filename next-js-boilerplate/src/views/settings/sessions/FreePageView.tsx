"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetch, apiFetchJson } from "@/lib/api-client";
import { useCallback, useEffect, useState } from "react";
import { IconDeviceDesktop, IconDeviceMobile, IconWorld } from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-time";
import { SESSIONS_LIST_URL, SESSIONS_REVOKE_URL, SESSIONS_REVOKE_OTHERS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSessionsPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { SessionInfo } from "@/types/settings/SessionInfo-types";

export function FreePageView() {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ sessions: SessionInfo[] }>(SESSIONS_LIST_URL)
      .then((data) => setSessions(data.sessions))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, [user]);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      try {
        await apiFetchJson(SESSIONS_REVOKE_URL, {
          method: POST,
          body: JSON.stringify({ sessionId }),
          headers: JSON_CONTENT_TYPE_HEADER,
        });
        setSessions((prev) =>
          prev.filter((s) => s.sessionId !== sessionId),
        );
      } catch {
        // silently fail
      }
    },
    [],
  );

  const revokeAllOtherSessions = useCallback(async () => {
    try {
      await apiFetch(SESSIONS_REVOKE_OTHERS_URL, { method: POST });
      setSessions((prev) =>
        prev.filter((s) => s.sessionId === user?.sessionId),
      );
    } catch {
      // silently fail
    }
  }, [user?.sessionId]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageSessions} />;

  const currentSessionId = user.sessionId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand">Sessions & Devices</h2>
        <div className="flex items-center gap-2">
          {sessions.length > 1 && (
            <button
              onClick={revokeAllOtherSessions}
              className="text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              Log out all other sessions
            </button>
          )}
          <PageInfoButton content={settingsSessionsPageInfo} />
        </div>
      </div>

      {loadingSessions ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted">
          No active sessions found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const isCurrent = session.sessionId === currentSessionId;
            const isMobile = session.userAgent?.toLowerCase().includes("mobile") || session.userAgent?.toLowerCase().includes("android") || session.userAgent?.toLowerCase().includes("iphone");

            return (
              <div
                key={session.sessionId}
                className={`border-border bg-bg flex items-start justify-between gap-4 rounded-lg border p-4 ${
                  isCurrent ? "border-brand/30 ring-brand/10 ring-1" : ""
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    isCurrent ? "bg-brand/10 text-brand" : "bg-surface text-muted"
                  }`}>
                    {isMobile ? <IconDeviceMobile size={20} stroke={1.5} /> : <IconDeviceDesktop size={20} stroke={1.5} />}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {session.userAgent
                          ? session.userAgent.split(" ").slice(0, 3).join(" ") ||
                            session.userAgent.slice(0, 40)
                          : "Unknown device"}
                      </span>
                      {isCurrent && (
                        <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      {session.ip && (
                        <span className="flex items-center gap-1">
                          <IconWorld size={12} stroke={1.5} />
                          IP: {session.ip}
                        </span>
                      )}
                      {session.issuedAt && (
                        <span>
                          Started: {formatDateTime(session.issuedAt)}
                        </span>
                      )}
                    </div>
                    {session.deviceId && (
                      <details className="group mt-1">
                        <summary className="text-[10px] text-muted/60 hover:text-muted cursor-pointer list-none">
                          More Device Info
                        </summary>
                        <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-muted/50">
                          <span>Device ID: {session.deviceId}</span>
                          <span className="break-all">User-Agent: {session.userAgent ?? "N/A"}</span>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => revokeSession(session.sessionId)}
                    className="text-xs text-red-600 hover:text-red-700 whitespace-nowrap transition-colors shrink-0"
                    aria-label={`Revoke session from ${session.ip ?? "unknown device"}`}
                  >
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
