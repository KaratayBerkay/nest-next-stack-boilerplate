"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldMessages } from "@/components/ui/field-messages";
import type { z } from "zod";
import { FormInputField } from "./FormInputField";
import { SocialButtons } from "./SocialButtons";

interface LoginFormProps {
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

function getFieldError(
  errors: (string | { message?: string } | undefined)[],
): string | undefined {
  if (errors.length === 0) return undefined;
  return errors
    .map((e) => (typeof e === "string" ? e : e?.message))
    .filter(Boolean)
    .join(", ");
}

export function LoginForm({
  form,
  loginSchema,
  rememberMe,
  setRememberMe,
  formError,
  t,
}: LoginFormProps) {
  return (
    <Card className="w-full max-w-[480px]">
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="email"
            validators={{
              onChange: loginSchema.shape.email,
              onBlur: loginSchema.shape.email,
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormInputField
                field={field}
                label={t.form.login.emailLabel}
                type="email"
                placeholder={t.form.login.emailPlaceholder}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: loginSchema.shape.password,
              onBlur: loginSchema.shape.password,
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => (
              <FormInputField
                field={field}
                label={t.form.login.passwordLabel}
                type="password"
                placeholder={t.form.login.passwordPlaceholder}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="text-sm">
                {t.form.login.rememberMe}
              </label>
            </div>
            <div className="text-sm">
              <button
                type="button"
                className="text-brand hover:text-brand/80 font-semibold"
              >
                {t.form.login.forgotPassword}
              </button>
            </div>
          </div>

          {formError && <FieldMessages error={formError} />}

          <div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form.Subscribe selector={(s: any) => [s.canSubmit, s.isSubmitting]}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {([canSubmit, isSubmitting]: [any, any]) => (
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={!canSubmit}
                >
                  {isSubmitting
                    ? t.form.login.submitting
                    : t.form.login.submit}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <SocialButtons />
      </CardContent>
    </Card>
  );
}
