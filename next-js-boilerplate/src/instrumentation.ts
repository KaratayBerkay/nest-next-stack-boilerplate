import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";

import { markStartup, recordError, recordSpan } from "@/lib/observability";

export async function register(): Promise<void> {
  const runtime = process.env.NEXT_RUNTIME ?? "nodejs";
  markStartup(runtime);

  // Load secrets from Vault before the app initializes so process.env is
  // populated for all server-side code.
  if (runtime === "nodejs") {
    const { loadVaultIntoEnv } = await import("@/lib/vault");
    await loadVaultIntoEnv();
  }

  if (runtime === "nodejs") {
    const { logger } = await import("@/lib/logger");
    console.error = (...args) => logger.error(...args);
    console.warn = (...args) => logger.warn(...args);
    console.log = (...args) => logger.info(...args);
    console.debug = (...args) => logger.debug(...args);
  }

  const inMemoryProcessor: SpanProcessor = {
    onStart() {},
    onEnd(span) {
      recordSpan({
        name: span.name,
        traceId: span.spanContext().traceId,
        attributes: { ...span.attributes },
      });
    },
    async forceFlush() {},
    async shutdown() {},
  };

  const { registerOTel } = await import("@vercel/otel");
  registerOTel({
    serviceName: "next-js-boilerplate",
    spanProcessors: [inMemoryProcessor],
  });
}

export function onRequestError(
  error: unknown,
  _request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string },
): void {
  recordError({
    message: error instanceof Error ? error.message : String(error),
    routerKind: context.routerKind,
    route: context.routePath,
  });

  console.error({
    category: "http-exception",
    exceptionType: "CLIENT_REQUEST_ERROR",
    route: context.routePath,
    message: error instanceof Error ? error.message : String(error),
  });
}
