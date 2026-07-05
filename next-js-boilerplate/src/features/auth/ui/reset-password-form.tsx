"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { resetPasswordFormSchema } from "@/lib/validation/auth";
import { LOGIN_PATH } from "@/constants/routes";

export function ResetPasswordForm() {
  const t = useMessages("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

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
      <div className="flex flex-col gap-4">
        <h2 className="text-brand text-sm font-semibold">{t.form.resetPassword.title}</h2>
        <p className="text-sm text-red-600">{t.errors.resetPasswordTokenMissing}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-brand text-sm font-semibold">{t.form.resetPassword.title}</h2>
        <p className="text-sm text-green-600">{t.form.resetPassword.success}</p>
        <Link href={LOGIN_PATH} className="text-brand underline text-sm">
          {t.form.resetPassword.loginLink}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const body = await res.json();
        setFieldErrors({
          form: body.msg ?? t.errors.resetPasswordFailed,
        });
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push(LOGIN_PATH), 2000);
    } catch {
      setFieldErrors({ form: t.errors.resetPasswordFailed });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">{t.form.resetPassword.title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="reset-password-input" className="text-muted text-xs font-medium">
            {t.form.resetPassword.passwordLabel}
          </label>
          <input
            id="reset-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reset-password"
          />
          {fieldErrors.password && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reset-confirm-password-input" className="text-muted text-xs font-medium">
            {t.form.resetPassword.confirmPasswordLabel}
          </label>
          <input
            id="reset-confirm-password-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reset-confirm-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {fieldErrors.form && (
          <p className="text-sm text-red-600" data-testid="reset-error">
            {fieldErrors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
          data-testid="reset-submit"
        >
          {submitting ? t.form.resetPassword.submitting : t.form.resetPassword.submit}
        </button>
      </form>
    </div>
  );
}
