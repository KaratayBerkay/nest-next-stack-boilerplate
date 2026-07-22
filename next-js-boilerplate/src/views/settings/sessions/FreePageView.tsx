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

async function handleRevokeSessionModule(
  sessionId: string,
  revokeSession: (sessionId: string) => Promise<void>,
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
) {
  try {
    await revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  } catch {
  }
}

async function handleRevokeAllOtherSessionsModule(
  revokeOtherSessions: () => Promise<void>,
  currentSessionId: string | undefined,
  setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>,
) {
  try {
    await revokeOtherSessions();
    setSessions((prev) => prev.filter((s) => s.sessionId === currentSessionId));
  } catch {
  }
}

export function FreePageView({ className }: { className?: string }) {
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

  const handleRevokeSession = useCallback(
    (sessionId: string) => handleRevokeSessionModule(sessionId, revokeSession, setSessions),
    [revokeSession],
  );

  const handleRevokeAllOtherSessions = useCallback(
    () => handleRevokeAllOtherSessionsModule(revokeOtherSessions, user?.sessionId, setSessions),
    [revokeOtherSessions, user?.sessionId],
  );

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInToManageSessions} />;

  const currentSessionId = user.sessionId;

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title="Sessions & Devices"
        titleClassName="text-brand text-sm"
        actions={
          <>
            {sessions.length > 1 && (
              <button
                onClick={handleRevokeAllOtherSessions}
                className="text-xs text-red-600 transition-colors hover:text-red-700"
              >
                Log out all other sessions
              </button>
            )}
            <PageInfoButton content={settingsSessionsPageInfo} />
          </>
        }
      />

      {loadingSessions ? (
        <SessionSkeleton />
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
