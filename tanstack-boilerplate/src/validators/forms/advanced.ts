import { z } from "zod";

export function createAdvancedSchemas(t: Record<string, string>) {
  const memberName = z
    .string()
    .min(1, t.memberNameRequired ?? "Name is required");
  const memberEmail = z.string().email(t.memberEmailInvalid ?? "Invalid email");
  const memberRole = z.string().min(1, t.memberRoleRequired ?? "Select a role");

  const memberSchema = z.object({
    name: memberName,
    email: memberEmail,
    role: memberRole,
  });

  return {
    fullName: z.string().min(2, t.fullNameMin ?? "At least 2 characters"),
    email: z.string().email(t.emailInvalid ?? "Invalid email"),
    password: z.string().min(8, t.passwordMin ?? "At least 8 characters"),
    companyName: z
      .string()
      .min(1, t.companyNameRequired ?? "Company name is required"),
    taxId: z
      .string()
      .regex(
        /^[A-Z]{2}\d{2,13}[A-Z0-9]$/,
        t.taxIdInvalid ?? "Invalid tax ID format",
      ),
    industry: z.string().min(1, t.industryRequired ?? "Select an industry"),
    members: z.array(memberSchema).min(0),
    memberName,
    memberEmail,
    memberRole,
  };
}
