"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useCallback, useEffect, useState } from "react";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSessionsPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useSessionActions } from "@/api/client/sessions/actions";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { eventLogger } from "@/lib/event-logger";
import type { SessionInfo } from "@/types/settings/SessionInfo-types";
import { SessionCard } from "./SessionCard";
import { SessionSkeleton } from "./SessionSkeleton";
import { EmptySessions } from "./EmptySessions";

type ToastFn = ReturnType<typeof useToast>["toast"];

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
    eventLogger.emit({
      eventType: "exception",
      url: window.location.pathname,
      category: "application-exception",
      event: "sessions.load_failed",
      exceptionType: "CLIENT_ERROR",
      metadata: { message: err instanceof Error ? err.message : String(err) },
    });
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
  toast: ToastFn,
  failedMessage: string,
) {
  try {
    await revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  } catch {
    toast({ title: failedMessage, variant: "destructive" });
  }
}

async function handleRevokeAllOtherSessionsModule(
  revokeOtherSessions: () => Promise<void>,
  currentSessionId: string | undefined,
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
  toast: ToastFn,
  failedMessage: string,
) {
  try {
    await revokeOtherSessions();
    setSessions((prev) => prev.filter((s) => s.sessionId === currentSessionId));
  } catch {
    // Previously this silently did nothing — apiFetch (used before the
    // sibling apiFetchJson fix) never threw on a non-2xx response, so this
    // catch never even ran and the session list was optimistically cleared
    // regardless of whether the backend actually revoked anything.
    toast({ title: failedMessage, variant: "destructive" });
  }
}

export function FreePageView({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();
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
      handleRevokeSessionModule(
        sessionId,
        revokeSession,
        setSessions,
        toast,
        t.revokeSessionFailed,
      ),
    [revokeSession, toast, t.revokeSessionFailed],
  );

  const handleRevokeAllOtherSessions = useCallback(
    () =>
      handleRevokeAllOtherSessionsModule(
        revokeOtherSessions,
        user?.sessionId,
        setSessions,
        toast,
        t.revokeAllOtherSessionsFailed,
      ),
    [
      revokeOtherSessions,
      user?.sessionId,
      toast,
      t.revokeAllOtherSessionsFailed,
    ],
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
              <Button
                variant="link"
                size="xs"
                onClick={handleRevokeAllOtherSessions}
              >
                {t.logOutAllOtherSessions}
              </Button>
            )}
            <PageInfoButton content={settingsSessionsPageInfo} />
          </>
        }
      />

      {loadingSessions ? (
        <SessionSkeleton />
      ) : sessionsError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-error text-sm">{t.sessionsLoadFailed}</p>
          <Button variant="outline" size="xs" onClick={handleRetry}>
            {t.sessionsRetry}
          </Button>
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
