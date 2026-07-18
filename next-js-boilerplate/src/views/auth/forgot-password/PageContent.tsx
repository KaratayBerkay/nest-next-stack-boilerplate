"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { LOGIN_PATH } from "@/constants/routes";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { requestPasswordResetServer } from "@/api/server/auth/request-password-reset";

async function handleForgotPasswordSubmit(
  e: React.SyntheticEvent,
  email: string,
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  t: I18nMessages["auth"],
) {
  e.preventDefault();
  setFieldErrors({});

  if (!email) {
    setFieldErrors({ email: t.errors.emailRequired });
    return;
  }

  setSubmitting(true);
  try {
    await requestPasswordResetServer(email);
    setSubmitted(true);
  } catch (err) {
    setFieldErrors({
      form: (err as Error).message ?? "Request failed",
    });
  } finally {
    setSubmitting(false);
  }
}

export function ForgotPasswordContent() {
  const t = useMessages("auth");

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.forgotPassword.title}
        </h2>
        <p className="text-sm text-green-600">
          {t.form.forgotPassword.success}
        </p>
        <Link href={LOGIN_PATH} className="text-brand text-sm underline">
          {t.form.forgotPassword.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.forgotPassword.title}
      </h2>

      <form
        onSubmit={(e) =>
          handleForgotPasswordSubmit(
            e,
            email,
            setFieldErrors,
            setSubmitting,
            setSubmitted,
            t,
          )
        }
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="forgot-email-input" required>
            {t.form.forgotPassword.emailLabel}
          </Label>
          <Input
            id="forgot-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.form.forgotPassword.emailPlaceholder}
            required
            error={fieldErrors.email}
            data-testid="forgot-email"
          />
          {fieldErrors.email && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {fieldErrors.form && (
          <p className="text-sm text-red-600" data-testid="forgot-error">
            {fieldErrors.form}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          data-testid="forgot-submit"
        >
          {submitting
            ? t.form.forgotPassword.submitting
            : t.form.forgotPassword.submit}
        </Button>
      </form>

      <Link href={LOGIN_PATH} className="text-muted hover:text-brand text-xs underline">
        {t.form.forgotPassword.loginLink}
      </Link>
    </div>
  );
}
