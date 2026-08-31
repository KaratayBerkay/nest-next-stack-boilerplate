import { z } from "zod";

export const simulateErrorSchema = z.object({
  scenarioId: z.string().min(1),
  delayMs: z.number().min(0).max(10_000).default(0),
  failRate: z.number().min(0).max(1).default(1),
});
