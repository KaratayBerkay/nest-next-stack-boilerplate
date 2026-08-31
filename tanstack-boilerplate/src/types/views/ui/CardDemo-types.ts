import type { AnyFieldApi } from "@tanstack/react-form";
import type { z } from "zod";
import type { variants, sizes } from "@/views/ui/card/variant-gallery-data";

export interface LoginFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
  }>;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  formError: string | null;
  t: {
    form: {
      login: {
        emailLabel: string;
        emailPlaceholder: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        rememberMe: string;
        forgotPassword: string;
        submitting: string;
        submit: string;
      };
    };
    social: {
      continueWith: string;
    };
  };
}

export interface FormInputFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

export interface FeatureComparisonTableProps {
  selectedTier: string | null;
}

export interface RegisterFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerSchema: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export interface VariantCardProps {
  variant: (typeof variants)[number];
}

export interface SizeCardProps {
  size: (typeof sizes)[number];
}
