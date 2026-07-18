import { z } from "zod";

export const sendMessageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long (max 5000 characters)")
    .trim(),
});
