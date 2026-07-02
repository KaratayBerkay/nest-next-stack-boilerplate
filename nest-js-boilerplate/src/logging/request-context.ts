import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Per-request correlation context.
 *
 * One id is minted (or honored from an inbound header) at the very edge of the request and
 * stashed in an {@link AsyncLocalStorage}. Everything downstream in the same async context —
 * `pino-http` (via {@link getRequestId} in `genReqId`), route handlers, and {@link
 * OutboxService.emit} — reads the *same* id, so app log lines, the `x-request-id` response
 * header, and `AuditLog.requestId`/`correlationId` all line up. This is the correlation gap
 * called out in `docs/backend/research/logger.md`.
 */
export interface RequestContext {
  requestId: string;
}

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

const storage = new AsyncLocalStorage<RequestContext>();

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Express middleware (mounted first, before any logging) that establishes the request id:
 * honor an inbound `x-request-id` / `x-correlation-id` so an upstream gateway's id flows
 * through, otherwise mint a UUID. The id is echoed back on the response and made available to
 * the rest of the request via {@link getRequestId}.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incoming =
    firstHeader(req.headers[REQUEST_ID_HEADER]) ??
    firstHeader(req.headers[CORRELATION_ID_HEADER]);
  const requestId = incoming ?? randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  storage.run({ requestId }, () => next());
}

/**
 * The current request's id, or `undefined` when running outside an HTTP request (boot, cron
 * tick, broker worker). Safe to call anywhere — never throws.
 */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
