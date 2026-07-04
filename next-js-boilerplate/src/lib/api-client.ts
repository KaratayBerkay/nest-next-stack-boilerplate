"use client";

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
