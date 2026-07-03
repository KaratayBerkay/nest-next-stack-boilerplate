"use client";

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
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
