import { z } from "zod";

const exceptionTypeEnum = z.enum([
  "CLIENT_ERROR",
  "CLIENT_REJECTION",
  "CLIENT_REQUEST_ERROR",
]);

const frontendEventSchema = z.object({
  eventType: z.string().min(1).max(128),
  clientSessionId: z.string().min(1).max(64),
  timestamp: z.string(),
  userId: z.string().optional(),
  url: z.string().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  category: z
    .enum([
      "session",
      "page",
      "http-exception",
      "application-exception",
      "network",
      "database",
      "performance",
      "rtc",
    ])
    .optional(),
  event: z.string().optional(),
  exceptionType: exceptionTypeEnum.optional(),
  page: z.string().optional(),
  durationMs: z.number().optional(),
  rtcKind: z.enum(["call", "meeting", "stream"]).optional(),
  rtcId: z.string().max(128).optional(),
  roomName: z.string().max(256).optional(),
  mediaType: z.enum(["audio", "video", "screen"]).optional(),
  phase: z.string().max(64).optional(),
  errorMessage: z.string().max(4096).optional(),
  stack: z.string().max(16384).optional(),
});

export type FrontendEvent = z.infer<typeof frontendEventSchema>;

export const eventsBatchSchema = z.object({
  events: z.array(frontendEventSchema).min(1).max(50),
});
