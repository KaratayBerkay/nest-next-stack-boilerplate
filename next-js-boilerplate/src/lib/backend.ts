import "server-only";
import { cookies, headers as nextHeaders } from "next/headers";
import { DEVICE_TOKEN_COOKIE, RBAC_TOKEN_COOKIE, BACKEND_REFRESH_COOKIE, USER_TOKEN_COOKIE } from "./cookie";
import { serverEnv } from "./env";

export interface BackendResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers: Headers;
}

function backendBaseUrl(): string {
  return serverEnv().APP_URL;
}

async function forwardedForHeader(): Promise<Record<string, string>> {
  // Forward the client IP from the incoming request so the backend sees the real
  // browser IP (not the Next.js server's). Used by DeviceIpMiddleware for IP binding.
  const reqHeaders = await nextHeaders();
  const forwarded = reqHeaders.get("x-forwarded-for");
  return forwarded ? { "x-forwarded-for": forwarded } : {};
}

export async function sessionTokenHeaders(): Promise<Record<string, string>> {
  // The BFF's cookie names don't match the backend's production `__Secure-`
  // names, so forwarding the Cookie header alone isn't enough. Send the
  // fallback headers instead.
  const cookieStore = await cookies();
  const rbac = cookieStore.get(RBAC_TOKEN_COOKIE)?.value;
  const device = cookieStore.get(DEVICE_TOKEN_COOKIE)?.value;
  const refresh = cookieStore.get(BACKEND_REFRESH_COOKIE)?.value;
  const user = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  return {
    ...(rbac ? { "x-rbac-token": rbac } : {}),
    ...(device ? { "x-device-token": device } : {}),
    ...(refresh ? { "x-refresh-token": refresh } : {}),
    ...(user ? { "x-user-token": user } : {}),
  };
}

export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit & { body?: BodyInit } = {},
): Promise<BackendResponse<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...options.headers,
    },
  });

  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null as unknown as T;
  }

  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

interface GraphQlError {
  message: string;
  extensions?: { code?: string };
}

export interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  bearerToken?: string,
  extraHeaders?: Record<string, string>,
): Promise<{ data?: T; errors?: GraphQlError[]; headers: Headers }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}/graphql`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: GraphQlResponse<T> = await res.json();
  return { data: body.data, errors: body.errors, headers: res.headers };
}
