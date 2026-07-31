"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useCallback, useEffect, useState } from "react";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSessionsPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useSessionActions } from "@/api/client/sessions/actions";
import { cn } from "@/lib/cn";
import type { SessionInfo } from "@/types/settings/SessionInfo-types";
import { SessionCard } from "./SessionCard";
import { SessionSkeleton } from "./SessionSkeleton";
import { EmptySessions } from "./EmptySessions";

async function loadSessions(
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    const { listSessionsServer } = await import("@/api/server/sessions/list");
    const data = await listSessionsServer();
    setSessions(data);
    setError(false);
  } catch (err) {
    console.error("Failed to load sessions", err);
    setSessions([]);
    setError(true);
  } finally {
    setLoading(false);
  }
}

async function handleRevokeSessionModule(
  sessionId: string,
  revokeSession: (sessionId: string) => Promise<void>,
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
) {
  try {
    await revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  } catch {}
}

async function handleRevokeAllOtherSessionsModule(
  revokeOtherSessions: () => Promise<void>,
  currentSessionId: string | undefined,
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
) {
  try {
    await revokeOtherSessions();
    setSessions((prev) => prev.filter((s) => s.sessionId === currentSessionId));
  } catch {}
}

export function FreePageView({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState(false);
  const dateDisplay = useDateDisplayCookie();
  const { revokeSession, revokeOtherSessions } = useSessionActions();

  useEffect(() => {
    if (!user) return;
    void loadSessions(setSessions, setLoadingSessions, setSessionsError);
  }, [user]);

  const handleRetry = useCallback(() => {
    setLoadingSessions(true);
    void loadSessions(setSessions, setLoadingSessions, setSessionsError);
  }, []);

  const handleRevokeSession = useCallback(
    (sessionId: string) =>
      handleRevokeSessionModule(sessionId, revokeSession, setSessions),
    [revokeSession],
  );

  const handleRevokeAllOtherSessions = useCallback(
    () =>
      handleRevokeAllOtherSessionsModule(
        revokeOtherSessions,
        user?.sessionId,
        setSessions,
      ),
    [revokeOtherSessions, user?.sessionId],
  );

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageSessions} />;

  const currentSessionId = user.sessionId;

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.sessionsHeading}
        titleClassName="text-brand text-sm"
        actions={
          <>
            {sessions.length > 1 && (
              <button
                onClick={handleRevokeAllOtherSessions}
                className="text-xs text-red-600 transition-colors hover:text-red-700"
              >
                {t.logOutAllOtherSessions}
              </button>
            )}
            <PageInfoButton content={settingsSessionsPageInfo} />
          </>
        }
      />

      {loadingSessions ? (
        <SessionSkeleton />
      ) : sessionsError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-red-600">{t.sessionsLoadFailed}</p>
          <button
            onClick={handleRetry}
            className="border-border bg-surface text-fg hover:bg-surface-hover rounded-md border px-3 py-1.5 text-xs transition-colors"
          >
            {t.sessionsRetry}
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              isCurrent={session.sessionId === currentSessionId}
              dateDisplay={dateDisplay}
              onRevoke={handleRevokeSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}
