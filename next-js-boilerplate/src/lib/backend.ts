import "server-only";
import { cookies, headers as nextHeaders } from "next/headers";
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
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: GraphQlResponse<T> = await res.json();
  return { data: body.data, errors: body.errors, headers: res.headers };
}
