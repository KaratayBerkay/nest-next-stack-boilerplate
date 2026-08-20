export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Single source of truth for password complexity, shared by the zod schemas
 * (submit-time validation) and the live requirements checklist (as-you-type
 * feedback). Mirrors the class-validator rules on the backend DTOs.
 */
export const passwordRuleChecks = {
  length: (password: string) =>
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH,
  lowercase: (password: string) => /[a-z]/.test(password),
  uppercase: (password: string) => /[A-Z]/.test(password),
  number: (password: string) => /[0-9]/.test(password),
} as const;

export type PasswordRuleKey = keyof typeof passwordRuleChecks;

export const passwordRuleOrder: PasswordRuleKey[] = [
  "length",
  "lowercase",
  "uppercase",
  "number",
];
