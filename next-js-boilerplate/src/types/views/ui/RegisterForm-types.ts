import type { z } from "zod";

export interface RegisterFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
  }>;
  formError: string | null;
  t: {
    form: {
      register: {
        firstNameLabel: string;
        firstNamePlaceholder: string;
        lastNameLabel: string;
        lastNamePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        confirmPasswordLabel: string;
        confirmPasswordPlaceholder: string;
        submitting: string;
        submit: string;
      };
    };
    social: {
      continueWith: string;
    };
  };
}
