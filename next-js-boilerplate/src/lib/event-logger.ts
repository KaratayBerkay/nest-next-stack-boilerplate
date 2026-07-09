import { apiFetch } from "@/lib/api-client";
import { FrontendEvent } from "./events.schema";
import { nowMs, toISOString } from "@/lib/date-time";
import { EVENTS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

type Listener = (event: FrontendEvent) => void;

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${nowMs()}-${Math.random().toString(36).slice(2)}`;
    // Persist across page reloads
    try {
      const stored = sessionStorage.getItem("fe:sessionId");
      if (stored) sessionId = stored;
      else sessionStorage.setItem("fe:sessionId", sessionId);
    } catch {
      // sessionStorage may be unavailable
    }
  }
  return sessionId;
}

const BATCH_INTERVAL_MS = 5000;
const BATCH_MAX_SIZE = 10;

const batch: FrontendEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: Listener[] = [];

async function flush(): Promise<void> {
  if (batch.length === 0) return;
  const events = batch.splice(0);
  try {
    await apiFetch(EVENTS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ events }),
    });
  } catch {
    // fire-and-forget: swallow errors silently on the client
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, BATCH_INTERVAL_MS);
}

function enqueue(event: FrontendEvent): void {
  batch.push(event);
  listeners.forEach((fn) => fn(event));
  if (batch.length >= BATCH_MAX_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    void flush();
  } else {
    scheduleFlush();
  }
}

export const eventLogger = {
  /** Emit a structured event. Batched and sent fire-and-forget. */
  emit(event: Omit<FrontendEvent, "clientSessionId" | "timestamp">): void {
    enqueue({
      ...event,
      clientSessionId: getSessionId(),
      timestamp: toISOString(),
    });
  },

  /** Subscribe to every emitted event (for devtools, debugging). */
  subscribe(fn: Listener): () => void {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  /** Flush pending events immediately. */
  flushNow(): Promise<void> {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    return flush();
  },
};

// Auto-flush on page unload so batched events aren't lost
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (batch.length > 0) {
      navigator.sendBeacon(EVENTS_URL, JSON.stringify({ events: batch }));
    }
  });
}
