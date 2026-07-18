export function useSessionActions() {
  const revokeSession = async (sessionId: string) => {
    const { revokeSessionServer } = await import("@/api/server/sessions/revoke");
    await revokeSessionServer(sessionId);
  };

  const revokeOtherSessions = async () => {
    const { revokeAllOtherSessionsServer } = await import(
      "@/api/server/sessions/revoke-others"
    );
    await revokeAllOtherSessionsServer();
  };

  return { revokeSession, revokeOtherSessions };
}
