import { z } from "zod";
import { inviteSchema } from "./invite";

export const inviteDefaultValues = {
  emails: [] as string[],
  emailInput: "",
  role: "member" as "member" | "admin" | "owner",
  message: "",
} satisfies z.input<typeof inviteSchema> & { emailInput: string };

type InviteFormValues = typeof inviteDefaultValues;

export function createInviteInitialValues(record?: InviteFormValues): InviteFormValues {
  if (!record) return { ...inviteDefaultValues };
  return { ...record };
}
