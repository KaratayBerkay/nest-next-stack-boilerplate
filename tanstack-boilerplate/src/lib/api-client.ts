"use client";

import { POST } from "@/constants/api/methods";
import { AUTH_REFRESH_URL } from "@/constants/api/urls";

export type ExceptionFieldError = {
  field: string;
  msg: string;
  key: string;
};

export type ExceptionResponse = {
  statusCode: number;
  exc: string;
  msg: string;
  key: string;
  field?: string;
  fields?: ExceptionFieldError[];
};

// Single-flight guard: concurrent 401s share one refresh attempt instead of
// hammering the endpoint. Cleared in the finally so the next 401 can retry.
let refreshInFlight: Promise<Response> | null = null;

/**
 * Ask the BFF to rotate the session via the backend `refresh` mutation.
 * Deliberately uses raw fetch (NOT apiFetch) — a failing refresh must not
 * recurse back into itself. Single-flight: concurrent callers share one
 * attempt. Resolves with the raw Response so callers can distinguish a
 * definitive 401 (dead session) from a transient backend failure.
 */
function attemptRefresh(): Promise<Response> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(AUTH_REFRESH_URL, { method: POST });
        if (res.ok) {
          try {
            const body = (await res.json()) as { deviceToken?: string };
            if (body.deviceToken) {
              const { setDeviceToken } =
                await import("@/lib/crypto/device-storage");
              setDeviceToken(body.deviceToken);
            }
          } catch {
            /* non-critical — device token may not be present */
          }
        }
        return res;
      } catch {
        return new Response(null, { status: 599 });
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Public handle for callers that want to rotate the session on their own
 *  trigger (e.g. a tier-changed WS frame, whose rbac token goes stale). */
export function refreshSession(): Promise<boolean> {
  return attemptRefresh().then((res) => res.ok);
}

/** Public handle for callers that need the raw refresh Response to react to
 *  the exact status (e.g. realtime re-connect: 401 = dead session). */
export function refreshSessionResponse(): Promise<Response> {
  return attemptRefresh();
}

/**
 * This module assumes a browser (relative paths resolve against
 * document.location). It also runs server-side whenever a "use client"
 * component that calls it is part of Next.js's initial SSR pass (e.g. a
 * useSuspenseQuery fetcher) — Node's fetch has no implicit origin, so a bare
 * "/api/..." path throws "Failed to parse URL". Resolve against this app's
 * own origin in that case; every route these helpers call is this app's own
 * BFF route, never the backend directly.
 */
function resolveServerSideUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof window !== "undefined" || typeof input !== "string") return input;
  if (!input.startsWith("/")) return input;
  const base = process.env.NEXT_PUBLIC_APP_URL;
  return base ? new URL(input, base).toString() : input;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { suppressGlobalLogout?: boolean },
): Promise<Response> {
  const resolvedInput = resolveServerSideUrl(input);
  const mergedInit = { ...init };
  if (typeof window !== "undefined") {
    try {
      const { getDeviceToken } = await import("@/lib/crypto/device-storage");
      const dt = getDeviceToken();
      if (dt) {
        mergedInit.headers = {
          ...(mergedInit.headers as Record<string, string>),
          "x-device-token": dt,
        };
      }
    } catch {
      /* non-critical — proceed without device header */
    }
  }
  let res = await fetch(resolvedInput, mergedInit);

  if (res.status === 401 && typeof window !== "undefined") {
    // One silent refresh-and-retry before declaring the session dead. The 401
    // was produced by a stale token set, so after a successful rotation the
    // request is safe to re-issue exactly as-is (it never reached a handler).
    const refreshed = await attemptRefresh();
    if (refreshed.ok) {
      res = await fetch(resolvedInput, mergedInit);
    }
    // The refresh endpoint itself answering 401/403 is a *definitive* dead
    // session — no retry can revive it, so it must end the session even for
    // opted-out callers below (observed live: a stale tab's active-call and
    // usage polls suppressed logout and kept hammering the backend with a
    // dead session for minutes on end).
    const sessionDead = refreshed.status === 401 || refreshed.status === 403;
    // Background/best-effort widgets (unread badges, etc.) opt out of the
    // ambiguous case only: a single failed poll shouldn't nuke a session
    // that's otherwise fine — this was observed forcing a full logout seconds
    // after a successful login when the conversations badge's very first
    // fetch raced the fresh session.
    if (res.status === 401 && (sessionDead || !options?.suppressGlobalLogout)) {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
  }

  return res;
}

export async function apiFetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await apiFetch(input, init);
  if (!res.ok) {
    let body: Partial<ExceptionResponse> | undefined;
    try {
      body = (await res.json()) as Partial<ExceptionResponse>;
    } catch {
      /* ignore parse errors */
    }
    const err = new Error(
      body?.msg ?? `apiFetchJson: ${res.status} ${res.statusText}`,
    ) as Error & { exception?: ExceptionResponse };
    if (body?.exc && body?.msg) {
      err.exception = body as ExceptionResponse;
    }
    throw err;
  }
  return res.json() as Promise<T>;
}
