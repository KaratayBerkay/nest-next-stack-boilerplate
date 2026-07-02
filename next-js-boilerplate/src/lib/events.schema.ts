import { z } from "zod";

export const frontendEventSchema = z.object({
  eventType: z.string().min(1).max(128),
  clientSessionId: z.string().min(1).max(64),
  timestamp: z.string(),
  userId: z.string().optional(),
  url: z.string().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type FrontendEvent = z.infer<typeof frontendEventSchema>;

export const eventsBatchSchema = z.object({
  events: z.array(frontendEventSchema).min(1).max(50),
});

export type EventsBatch = z.infer<typeof eventsBatchSchema>;
