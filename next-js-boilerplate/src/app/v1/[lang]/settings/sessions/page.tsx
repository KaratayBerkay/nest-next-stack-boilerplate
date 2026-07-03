"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { IconDeviceLaptop, IconDeviceMobile } from "@tabler/icons-react";

interface Session {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

function SessionRow({ session }: { session: Session }) {
  const isMobile =
    session.userAgent &&
    /mobile|android|iphone|ipad/i.test(session.userAgent);

  return (
    <div
      className={`border-border flex items-start gap-4 rounded-xl border p-4 ${
        session.current ? "border-brand/30 bg-brand/5" : ""
      }`}
    >
      <div className="text-muted mt-0.5">
        {isMobile ? (
          <IconDeviceMobile size={20} stroke={1.5} />
        ) : (
          <IconDeviceLaptop size={20} stroke={1.5} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {session.userAgent
              ? parseUserAgent(session.userAgent)
              : "Unknown device"}
          </p>
          {session.current && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Current
            </span>
          )}
        </div>
        {session.ip && (
          <p className="text-muted mt-0.5 text-xs">IP: {session.ip}</p>
        )}
        <div className="text-muted mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
          <span>
            Created: {new Date(session.createdAt).toLocaleDateString()}
          </span>
          <span>
            Expires: {new Date(session.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function parseUserAgent(ua: string): string {
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Postman")) return "Postman";
  return ua.split("/")[0] ?? "Unknown";
}

export default function SessionsPage() {
  const { user, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: sessions,
    error,
    isLoading: fetching,
    refetch,
  } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/auth/sessions");
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      return (data.sessions ?? []) as Session[];
    },
  });

  const handleLogoutOthers = useCallback(async () => {
    setLoggingOut(true);
    setConfirmOpen(false);
    try {
      const res = await fetch("/api/auth/logout-others", { method: "POST" });
      if (res.ok) {
        refetch();
      }
    } catch {
      /* ignore */
    } finally {
      setLoggingOut(false);
    }
  }, [refetch]);

  const otherCount = (sessions ?? []).filter((s) => !s.current).length;

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to manage sessions" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">Sessions & Devices</h2>
        {otherCount > 0 && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={loggingOut}
            className="bg-surface hover:bg-surface-hover text-fg rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loggingOut
              ? "Logging out..."
              : `Log out ${otherCount} other session${otherCount > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error.message}
        </div>
      )}

      {fetching ? (
        <div className="text-muted flex items-center justify-center py-12 text-sm">
          Loading sessions...
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="text-muted flex items-center justify-center py-12 text-sm">
          No sessions found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg mx-4 w-full max-w-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Log out other sessions?</h3>
            <p className="text-muted mt-2 text-sm">
              This will sign out all your other devices. Your current session
              will stay active.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-muted hover:bg-surface-hover rounded-lg px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutOthers}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Log out others
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
