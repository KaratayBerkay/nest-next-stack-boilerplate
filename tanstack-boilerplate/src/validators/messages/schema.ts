import { z } from "zod";

export const sendMessageSchema = z.object({
  text: z
    .string()
    .max(5000, "Message is too long (max 5000 characters)")
    .trim(),
});
