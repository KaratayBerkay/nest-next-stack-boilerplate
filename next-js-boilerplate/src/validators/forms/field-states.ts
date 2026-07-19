import { z } from "zod";

export function createFieldStateSchemas(t: Record<string, string>) {
  return {
    name: z.string().min(2, t.nameMin ?? "At least 2 characters"),
    email: z.string().email(t.emailInvalid ?? "Invalid email"),
    role: z.string().min(1, t.roleRequired ?? "Select a role"),
  };
}
