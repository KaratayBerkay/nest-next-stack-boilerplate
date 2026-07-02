import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";

import { markStartup, recordError, recordSpan } from "@/lib/observability";

// `register()` is Next.js's instrumentation startup hook: it runs exactly once
// when a server instance boots (before any request is handled), in both the
// Node.js and Edge runtimes. We use it to (1) record a startup marker and
// (2) wire up OpenTelemetry via `@vercel/otel` — the path the Next.js
// observability docs recommend.
export async function register(): Promise<void> {
  const runtime = process.env.NEXT_RUNTIME ?? "nodejs";
  markStartup(runtime);

  // Shim console.* through pino so any stray log from Next.js internals or
  // third-party deps lands as structured JSON (Node.js runtime only).
  if (runtime === "nodejs") {
    const { logger } = await import("@/lib/logger");
    console.error = (...args) => logger.error(...args);
    console.warn = (...args) => logger.warn(...args);
    console.log = (...args) => logger.info(...args);
    console.debug = (...args) => logger.debug(...args);
  }

  // A minimal in-memory SpanProcessor. Instead of shipping traces to an external
  // collector over OTLP, it mirrors every finished span into our shared store so
  // the boilerplate can *prove* traces are exported with zero infra. In a real
  // deployment swap this for `'auto'` or an OTLP exporter.
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

// `onRequestError` is Next.js's instrumentation error hook: it fires for every
// uncaught server-side error (RSC render, Route Handler, Server Action). We log
// each into the same store so the demo can surface server errors alongside traces.
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
}
