import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { Logger } from "pino";
import { logger as rootLogger } from "./logger";

export interface RequestContext {
  correlationId: string;
  userId?: string;
  page?: string;
}

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";

const storage = new AsyncLocalStorage<RequestContext>();

function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

function getLogger(context?: Partial<RequestContext>): Logger {
  const store = storage.getStore();
  const bindings: Record<string, unknown> = {};

  if (store?.correlationId) bindings.correlationId = store.correlationId;
  if (store?.userId) bindings.userId = store.userId;
  if (store?.page) bindings.page = store.page;
  if (context?.correlationId) bindings.correlationId = context.correlationId;
  if (context?.userId) bindings.userId = context.userId;
  if (context?.page) bindings.page = context.page;

  return Object.keys(bindings).length > 0
    ? rootLogger.child(bindings)
    : rootLogger;
}

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
