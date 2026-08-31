import { eventLogger } from "@/lib/event-logger";
import type { RtcTelemetryEventOptions } from "@/types/rtc/RtcTelemetry-types";

function errorFields(error: unknown): {
  errorMessage?: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      stack: error.stack,
    };
  }
  if (error === undefined || error === null) return {};
  return { errorMessage: String(error) };
}

/** Emits RTC telemetry through the same batched client-event pipeline as the rest of the app. */
export function logRtcEvent(options: RtcTelemetryEventOptions): void {
  const {
    event,
    error,
    metadata,
    rtcKind,
    rtcId,
    roomName,
    mediaType,
    phase,
    exceptionType,
  } = options;
  const fields = errorFields(error);

  eventLogger.emit({
    eventType: event,
    event,
    category: "rtc",
    url: window.location.pathname,
    userAgent: navigator.userAgent,
    rtcKind,
    ...(rtcId ? { rtcId } : {}),
    ...(roomName ? { roomName } : {}),
    ...(mediaType ? { mediaType } : {}),
    ...(phase ? { phase } : {}),
    ...fields,
    ...(exceptionType ? { exceptionType } : {}),
    ...(metadata ? { metadata } : {}),
  });
}
