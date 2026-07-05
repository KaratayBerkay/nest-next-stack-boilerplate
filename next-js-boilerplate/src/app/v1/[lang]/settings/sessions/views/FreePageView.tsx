"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetch, apiFetchJson } from "@/lib/api-client";
import { useCallback, useEffect, useState } from "react";

interface SessionInfo {
  sessionId: string;
  deviceId: string;
  ip?: string;
  userAgent?: string;
  issuedAt?: string;
}

export function FreePageView() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ sessions: SessionInfo[] }>("/api/sessions/list")
      .then((data) => setSessions(data.sessions))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false));
  }, [user]);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      try {
        await apiFetchJson("/api/sessions/revoke", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
          headers: { "Content-Type": "application/json" },
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
      await apiFetch("/api/sessions/revoke-others", { method: "POST" });
      setSessions((prev) =>
        prev.filter((s) => s.sessionId === user?.sessionId),
      );
    } catch {
      // silently fail
    }
  }, [user?.sessionId]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to manage sessions" />;

  const currentSessionId = user.sessionId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand">Sessions & Devices</h2>
        {sessions.length > 1 && (
          <button
            onClick={revokeAllOtherSessions}
            className="text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            Log out all other sessions
          </button>
        )}
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
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="border-border bg-bg flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {session.userAgent
                      ? session.userAgent.split(" ").slice(0, 3).join(" ") ||
                        session.userAgent.slice(0, 40)
                      : "Unknown device"}
                  </span>
                  {session.sessionId === currentSessionId && (
                    <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-medium">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {session.ip && <span>IP: {session.ip}</span>}
                  {session.issuedAt && (
                    <span>
                      Started:{" "}
                      {new Date(session.issuedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {session.sessionId !== currentSessionId && (
                <button
                  onClick={() => revokeSession(session.sessionId)}
                  className="text-xs text-red-600 hover:text-red-700 whitespace-nowrap transition-colors"
                  aria-label={`Revoke session from ${session.ip ?? "unknown device"}`}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
