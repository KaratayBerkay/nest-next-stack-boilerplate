import { z } from "zod";

export function generateAuthLoginSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return z.object({
    email: z
      .string()
      .min(1, errors.emailRequired)
      .email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(8, errors.passwordMin)
      .max(128, errors.passwordMax),
  });
}

export function generateAuthRegisterSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return z.object({
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
  });
}

export const loginFormSchema = generateAuthLoginSchema;
export const registerFormSchema = generateAuthRegisterSchema;
