import { trace } from "@opentelemetry/api";
import { connection } from "next/server";

import { observabilityState } from "@/lib/observability";

// GET creates one explicit custom span, then reports the observability store:
// `startedAt` proves the `register()` startup hook ran, and the captured spans
// prove our OpenTelemetry processor is exporting traces. `connection()` opts the
// handler into per-request (dynamic) rendering — under `cacheComponents` the old
// `export const dynamic` segment config is gone (see docs-issue #25), so a dynamic
// API is how you keep a Route Handler fresh.
export async function GET() {
  await connection();

  const tracer = trace.getTracer("observability-demo");
  tracer.startActiveSpan("observability.check", (span) => {
    span.setAttribute("demo", true);
    // Our SpanProcessor.onEnd fires synchronously here, so the span is in the
    // store by the time we read it below.
    span.end();
  });

  const state = observabilityState();
  return Response.json({
    startedAt: state.startedAt,
    runtime: state.runtime,
    uptimeMs: state.startedAt ? Date.now() - state.startedAt : null,
    spanCount: state.spans.length,
    // Most-recent span names (newest last) — proves auto-instrumentation too.
    recentSpans: state.spans.slice(-10).map((s) => s.name),
    customSpanExported: state.spans.some(
      (s) => s.name === "observability.check",
    ),
    errors: state.errors.slice(-5),
  });
}
