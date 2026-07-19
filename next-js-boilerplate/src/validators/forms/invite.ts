import { z } from "zod";

export const inviteSchema = z.object({
  emails: z.array(z.string().email("Invalid email")).min(1, "At least one email required"),
  role: z.enum(["member", "admin", "owner"]),
  message: z.string().max(1000).optional(),
});
