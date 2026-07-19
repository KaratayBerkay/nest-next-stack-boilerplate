import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface RequestContext {
  correlationId: string;
  userId?: string;
  page?: string;
}

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";

const storage = new AsyncLocalStorage<RequestContext>();

export function extractRequestId(request: {
  headers: Headers | Record<string, string | string[] | undefined>;
}): string {
  const get = (h: string): string | undefined => {
    if (request.headers instanceof Headers) {
      return request.headers.get(h) ?? undefined;
    }
    const v = (
      request.headers as Record<string, string | string[] | undefined>
    )[h];
    return Array.isArray(v) ? v[0] : v;
  };

  return get(REQUEST_ID_HEADER) ?? get(CORRELATION_ID_HEADER) ?? randomUUID();
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}
