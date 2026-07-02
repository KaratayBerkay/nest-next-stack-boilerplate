import type { NextRequest } from "next/server";
import type { Logger } from "pino";
import { logger as rootLogger } from "./logger";
import {
  extractRequestId,
  runWithContext,
  type RequestContext,
} from "./request-context";

const ACCESS_TOKEN_COOKIE = "access_token";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function extractUserId(request: NextRequest): string | undefined {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return undefined;
  const payload = parseJwtPayload(token);
  return (payload?.sub as string) ?? (payload?.userId as string) ?? undefined;
}

export function buildContext(request: NextRequest): RequestContext {
  return {
    correlationId: extractRequestId(request),
    userId: extractUserId(request),
    page: request.nextUrl.pathname,
  };
}

export type LoggedHandler<T = Response> = (
  request: NextRequest,
  log: Logger,
) => Promise<T>;

export function withLogging<T = Response>(
  handler: LoggedHandler<T>,
): (request: NextRequest) => Promise<T> {
  return async (request: NextRequest) => {
    const ctx = buildContext(request);
    const bindings: Record<string, unknown> = {
      correlationId: ctx.correlationId,
      page: ctx.page,
    };
    if (ctx.userId) bindings.userId = ctx.userId;

    const log = rootLogger.child(bindings);

    return runWithContext(ctx, () => handler(request, log));
  };
}
