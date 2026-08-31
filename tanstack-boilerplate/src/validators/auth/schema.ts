import { z } from "zod";
import { passwordRuleChecks } from "@/validators/auth/password-policy";

interface PasswordComplexityErrors {
  passwordLowercase: string;
  passwordUppercase: string;
  passwordNumber: string;
}

function passwordComplexity(
  schema: z.ZodString,
  errors: PasswordComplexityErrors,
) {
  return schema
    .refine(passwordRuleChecks.lowercase, errors.passwordLowercase)
    .refine(passwordRuleChecks.uppercase, errors.passwordUppercase)
    .refine(passwordRuleChecks.number, errors.passwordNumber);
}

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

function generateAuthRegisterSchema(
  errors: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin: string;
    passwordMax: string;
  } & PasswordComplexityErrors,
) {
  return z.object({
    name: z.string().optional(),
    email: z.string().min(1, errors.emailRequired).email(errors.emailInvalid),
    password: passwordComplexity(
      z
        .string()
        .min(1, errors.passwordRequired)
        .min(8, errors.passwordMin)
        .max(128, errors.passwordMax),
      errors,
    ),
  });
}

function generateResetPasswordFormSchema(
  errors: {
    passwordRequired: string;
    passwordMin: string;
    passwordMax: string;
    passwordsMustMatch: string;
  } & PasswordComplexityErrors,
) {
  return z
    .object({
      password: passwordComplexity(
        z
          .string()
          .min(1, errors.passwordRequired)
          .min(8, errors.passwordMin)
          .max(128, errors.passwordMax),
        errors,
      ),
      confirmPassword: z.string().min(1, errors.passwordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: errors.passwordsMustMatch,
      path: ["confirmPassword"],
    });
}

function generateChangePasswordFormSchema(
  errors: {
    currentPasswordRequired: string;
    passwordRequired: string;
    passwordMin: string;
    passwordMax: string;
    passwordsMustMatch: string;
  } & PasswordComplexityErrors,
) {
  return z
    .object({
      currentPassword: z.string().min(1, errors.currentPasswordRequired),
      newPassword: passwordComplexity(
        z
          .string()
          .min(1, errors.passwordRequired)
          .min(8, errors.passwordMin)
          .max(128, errors.passwordMax),
        errors,
      ),
      confirmNewPassword: z.string().min(1, errors.passwordRequired),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: errors.passwordsMustMatch,
      path: ["confirmNewPassword"],
    });
}

export const loginFormSchema = generateAuthLoginSchema;
export const registerFormSchema = generateAuthRegisterSchema;
export const resetPasswordFormSchema = generateResetPasswordFormSchema;
export const changePasswordFormSchema = generateChangePasswordFormSchema;

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
