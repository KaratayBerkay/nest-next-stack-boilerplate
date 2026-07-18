"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useCallback, useEffect, useState } from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconWorld,
} from "@tabler/icons-react";
import { formatDateTimeByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSessionsPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useSessionActions } from "@/api/client/sessions/actions";
import type { SessionInfo } from "@/types/settings/SessionInfo-types";

export function FreePageView() {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const dateDisplay = useDateDisplayCookie();
  const { revokeSession, revokeOtherSessions } = useSessionActions();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { listSessionsServer } = await import("@/api/server/sessions/list");
        const data = await listSessionsServer();
        setSessions(data as unknown as SessionInfo[]);
      } catch {
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, [user]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch {
      // silently fail
    }
  }, [revokeSession]);

  const handleRevokeAllOtherSessions = useCallback(async () => {
    try {
      await revokeOtherSessions();
      setSessions((prev) =>
        prev.filter((s) => s.sessionId === user?.sessionId),
      );
    } catch {
      // silently fail
    }
  }, [revokeOtherSessions, user?.sessionId]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageSessions} />;

  const currentSessionId = user.sessionId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">Sessions & Devices</h2>
        <div className="flex items-center gap-2">
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOtherSessions}
              className="text-xs text-red-600 transition-colors hover:text-red-700"
            >
              Log out all other sessions
            </button>
          )}
          <PageInfoButton content={settingsSessionsPageInfo} />
        </div>
      </div>

      {loadingSessions ? (
        <div className="text-muted flex items-center justify-center py-12 text-sm">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-muted flex items-center justify-center py-12 text-sm">
          No active sessions found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const isCurrent = session.sessionId === currentSessionId;
            const isMobile =
              session.userAgent?.toLowerCase().includes("mobile") ||
              session.userAgent?.toLowerCase().includes("android") ||
              session.userAgent?.toLowerCase().includes("iphone");

            return (
              <div
                key={session.sessionId}
                className={`border-border bg-bg flex items-start justify-between gap-4 rounded-lg border p-4 ${
                  isCurrent ? "border-brand/30 ring-brand/10 ring-1" : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      isCurrent
                        ? "bg-brand/10 text-brand"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {isMobile ? (
                      <IconDeviceMobile size={20} stroke={1.5} />
                    ) : (
                      <IconDeviceDesktop size={20} stroke={1.5} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {session.userAgent
                          ? session.userAgent
                              .split(" ")
                              .slice(0, 3)
                              .join(" ") || session.userAgent.slice(0, 40)
                          : "Unknown device"}
                      </span>
                      {isCurrent && (
                        <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {session.ip && (
                        <span className="flex items-center gap-1">
                          <IconWorld size={12} stroke={1.5} />
                          IP: {session.ip}
                        </span>
                      )}
                      {session.issuedAt && (
                        <span>
                          Started: {formatDateTimeByPreference(session.issuedAt, dateDisplay)}
                        </span>
                      )}
                    </div>
                    {session.deviceId && (
                      <details className="group mt-1">
                        <summary className="text-muted/60 hover:text-muted cursor-pointer list-none text-[10px]">
                          More Device Info
                        </summary>
                        <div className="text-muted/50 mt-1 flex flex-col gap-0.5 text-[10px]">
                          <span>Device ID: {session.deviceId}</span>
                          <span className="break-all">
                            User-Agent: {session.userAgent ?? "N/A"}
                          </span>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.sessionId)}
                    className="shrink-0 text-xs whitespace-nowrap text-red-600 transition-colors hover:text-red-700"
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
