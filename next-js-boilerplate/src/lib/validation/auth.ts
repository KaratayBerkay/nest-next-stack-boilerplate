import { z } from "zod";

export function loginFormSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return {
    email: z
      .string()
      .min(1, errors.emailRequired)
      .email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(8, errors.passwordMin)
      .max(128, errors.passwordMax),
  };
}

export function registerFormSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return {
    name: z.string().optional(),
    email: z
      .string()
      .min(1, errors.emailRequired)
      .email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(8, errors.passwordMin)
      .max(128, errors.passwordMax),
  };
}
