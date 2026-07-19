import { z } from "zod";

function generateAuthLoginSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return z.object({
    email: z.string().min(1, errors.emailRequired).email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(8, errors.passwordMin)
      .max(128, errors.passwordMax),
  });
}

function generateAuthRegisterSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
}) {
  return z.object({
    name: z.string().optional(),
    email: z.string().min(1, errors.emailRequired).email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(8, errors.passwordMin)
      .max(128, errors.passwordMax),
  });
}

function generateResetPasswordFormSchema(errors: {
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
  passwordsMustMatch: string;
}) {
  return z
    .object({
      password: z
        .string()
        .min(1, errors.passwordRequired)
        .min(8, errors.passwordMin)
        .max(128, errors.passwordMax),
      confirmPassword: z.string().min(1, errors.passwordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: errors.passwordsMustMatch,
      path: ["confirmPassword"],
    });
}

export const loginFormSchema = generateAuthLoginSchema;
export const registerFormSchema = generateAuthRegisterSchema;
export const resetPasswordFormSchema = generateResetPasswordFormSchema;

// ---------- Card page schemas ----------

function generateCardLoginSchema(errors: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin6: string;
}) {
  return z.object({
    email: z.string().min(1, errors.emailRequired).email(errors.emailInvalid),
    password: z
      .string()
      .min(1, errors.passwordRequired)
      .min(6, errors.passwordMin6),
  });
}

function generateCardRegisterSchema(errors: {
  firstNameRequired: string;
  lastNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin6: string;
  confirmPasswordRequired: string;
  passwordsMustMatch: string;
}) {
  return z
    .object({
      firstName: z.string().min(1, errors.firstNameRequired),
      lastName: z.string().min(1, errors.lastNameRequired),
      email: z.string().min(1, errors.emailRequired).email(errors.emailInvalid),
      password: z
        .string()
        .min(1, errors.passwordRequired)
        .min(6, errors.passwordMin6),
      confirmPassword: z.string().min(1, errors.confirmPasswordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: errors.passwordsMustMatch,
      path: ["confirmPassword"],
    });
}

export const cardLoginFormSchema = generateCardLoginSchema;
export const cardRegisterFormSchema = generateCardRegisterSchema;
