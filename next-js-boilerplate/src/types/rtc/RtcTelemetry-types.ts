export type RtcTelemetryKind = "call" | "meeting" | "stream";

export type RtcTelemetryMediaType = "audio" | "video" | "screen";

export type RtcTelemetryExceptionType =
  "CLIENT_ERROR" | "CLIENT_REJECTION" | "CLIENT_REQUEST_ERROR";

export interface RtcTelemetryContext {
  rtcKind: RtcTelemetryKind;
  rtcId?: string | null;
  roomName?: string | null;
  mediaType?: RtcTelemetryMediaType;
  phase?: string;
}

export interface RtcTelemetryEventOptions extends RtcTelemetryContext {
  event: string;
  exceptionType?: RtcTelemetryExceptionType;
  error?: unknown;
  metadata?: Record<string, unknown>;
}
