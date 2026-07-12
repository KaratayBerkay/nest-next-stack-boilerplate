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
    ])
    .optional(),
  event: z.string().optional(),
  exceptionType: exceptionTypeEnum.optional(),
  page: z.string().optional(),
  durationMs: z.number().optional(),
});

export type FrontendEvent = z.infer<typeof frontendEventSchema>;

export const eventsBatchSchema = z.object({
  events: z.array(frontendEventSchema).min(1).max(50),
});
