// Shared, server-side observability state for the F33 instrumentation demo.
//
// The startup hook (`src/instrumentation.ts`) and the `/api/observability` Route
// Handler live in *separate* Next.js bundles but the same Node process, so the
// store is pinned to `globalThis` to guarantee both read the same instance.
// Deliberately framework-agnostic (no `server-only`) because the instrumentation
// file is evaluated outside the normal React Server Component module graph.

export type RecordedSpan = {
  name: string;
  traceId: string;
  attributes: Record<string, unknown>;
};

export type RecordedError = {
  message: string;
  routerKind?: string;
  route?: string;
};

export type ObservabilityState = {
  startedAt: number | null;
  runtime: string | null;
  spans: RecordedSpan[];
  errors: RecordedError[];
};

import { MAX_SPANS, MAX_ERRORS } from "@/constants/observability";

const globalForObservability = globalThis as typeof globalThis & {
  __observability?: ObservabilityState;
};

export function observabilityState(): ObservabilityState {
  globalForObservability.__observability ??= {
    startedAt: null,
    runtime: null,
    spans: [],
    errors: [],
  };
  return globalForObservability.__observability;
}

// Called once from the startup hook; `??=` preserves the first values even if the
// hook re-runs (e.g. dev HMR re-evaluating the module).
export function markStartup(runtime: string): void {
  const state = observabilityState();
  state.startedAt ??= Date.now();
  state.runtime ??= runtime;
}

export function recordSpan(span: RecordedSpan): void {
  const { spans } = observabilityState();
  spans.push(span);
  if (spans.length > MAX_SPANS) spans.splice(0, spans.length - MAX_SPANS);
}

export function recordError(error: RecordedError): void {
  const { errors } = observabilityState();
  errors.push(error);
  if (errors.length > MAX_ERRORS) errors.splice(0, errors.length - MAX_ERRORS);
}
