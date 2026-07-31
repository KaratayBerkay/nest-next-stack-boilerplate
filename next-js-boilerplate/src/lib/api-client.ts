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
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Ask the BFF to rotate the session via the backend `refresh` mutation.
 * Deliberately uses raw fetch (NOT apiFetch) — a failing refresh must not
 * recurse back into itself. Single-flight: concurrent callers share one
 * attempt.
 */
function attemptRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(AUTH_REFRESH_URL, { method: POST });
        return res.ok;
      } catch {
        return false;
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
  return attemptRefresh();
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(input, init);

  if (res.status === 401 && typeof window !== "undefined") {
    // One silent refresh-and-retry before declaring the session dead. The 401
    // was produced by a stale token set, so after a successful rotation the
    // request is safe to re-issue exactly as-is (it never reached a handler).
    const refreshed = await attemptRefresh();
    if (refreshed) {
      res = await fetch(input, init);
    }
    if (res.status === 401) {
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
