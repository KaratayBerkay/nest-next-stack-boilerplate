"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { resetPasswordFormSchema } from "@/validators/auth/schema";
import { LOGIN_PATH } from "@/constants/routes";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { resetPasswordServer } from "@/api/server/auth/reset-password";
import type { ResetPasswordFormProps } from "@/types/auth/ResetPasswordForm-types";

async function handleResetPasswordSubmit(
  e: React.SyntheticEvent,
  schema: ReturnType<typeof resetPasswordFormSchema>,
  password: string,
  confirmPassword: string,
  token: string,
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  t: I18nMessages["auth"],
) {
  e.preventDefault();
  setFieldErrors({});

  const result = schema.safeParse({ password, confirmPassword });
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const [field, msgs] of Object.entries(flat)) {
      if (msgs && msgs.length > 0) errors[field] = msgs[0];
    }
    setFieldErrors(errors);
    return;
  }

  setSubmitting(true);
  try {
    await resetPasswordServer(token, password);
    setSuccess(true);
    setTimeout(() => router.push(LOGIN_PATH), 2000);
  } catch (err) {
    setFieldErrors({
      form: (err as Error).message ?? t.errors.resetPasswordFailed,
    });
  } finally {
    setSubmitting(false);
  }
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useMessages("auth");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const schema = resetPasswordFormSchema({
    passwordRequired: t.errors.passwordRequired,
    passwordMin: t.errors.passwordMin,
    passwordMax: t.errors.passwordMax,
    passwordsMustMatch: t.errors.passwordsMustMatch,
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.resetPassword.title}
        </h2>
        <p className="text-sm text-red-600">
          {t.errors.resetPasswordTokenMissing}
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.resetPassword.title}
        </h2>
        <p className="text-sm text-green-600">{t.form.resetPassword.success}</p>
        <Link href={LOGIN_PATH} className="text-brand text-sm underline">
          {t.form.resetPassword.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.resetPassword.title}
      </h2>

      <form
        onSubmit={(e) =>
          handleResetPasswordSubmit(
            e,
            schema,
            password,
            confirmPassword,
            token,
            setFieldErrors,
            setSubmitting,
            setSuccess,
            router,
            t,
          )
        }
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="reset-password-input" required>
            {t.form.resetPassword.passwordLabel}
          </Label>
          <Input
            id="reset-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            error={fieldErrors.password}
            data-testid="reset-password"
          />
          {fieldErrors.password && (
            <p className="mt-0.5 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="reset-confirm-password-input" required>
            {t.form.resetPassword.confirmPasswordLabel}
          </Label>
          <Input
            id="reset-confirm-password-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={fieldErrors.confirmPassword}
            data-testid="reset-confirm-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-0.5 text-xs text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {fieldErrors.form && (
          <p className="text-sm text-red-600" data-testid="reset-error">
            {fieldErrors.form}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          data-testid="reset-submit"
        >
          {submitting
            ? t.form.resetPassword.submitting
            : t.form.resetPassword.submit}
        </Button>
      </form>
    </div>
  );
}
