"use client";

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

async function singleFlightRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(input, init);

  if (res.status === 401) {
    const refreshed = await singleFlightRefresh();
    if (refreshed) {
      res = await fetch(input, init);
      if (typeof window !== "undefined") {
        // Tokens were reissued (possibly from a changed tier/role snapshot);
        // AuthProvider listens and rehydrates `me` so the UI reflects it.
        window.dispatchEvent(new CustomEvent("auth:refreshed"));
      }
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
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
    throw new Error(`apiFetchJson: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
