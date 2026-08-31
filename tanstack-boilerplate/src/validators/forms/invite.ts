import { z } from "zod";

const DEFAULT_INVITE_T: Record<string, string> = {
  emailRequired: "At least one email required",
  emailInvalid: "Invalid email",
  roleRequired: "Select a role",
};

export const inviteSchema = createInviteSchema(DEFAULT_INVITE_T);

export function createInviteSchema(t: Record<string, string>) {
  return z.object({
    emails: z
      .array(z.string().email(t.emailInvalid ?? "Invalid email"))
      .min(1, t.emailRequired ?? "At least one email required"),
    role: z.enum(["member", "admin", "owner"], {
      message: t.roleRequired ?? "Select a role",
    }),
    message: z.string().max(1000).optional(),
  });
}
