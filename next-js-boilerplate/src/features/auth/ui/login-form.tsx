"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { REGISTER_PATH, RESET_PASSWORD_PATH } from "@/constants/routes";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { loginFormSchema } from "@/lib/validation/auth";
import type { ExceptionResponse } from "@/lib/api-client";

export function LoginForm() {
  const t = useMessages("auth");
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const schema = loginFormSchema(t.errors);

  if (loading) {
    return <p className="text-muted text-sm">{t.loading}</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-600">
          {t.signedInAs.replace("{email}", user.email)}
        </p>
        <p className="text-muted text-xs">
          {t.role} {user.role} &middot; {t.status} {user.status}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse({ email, password });
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
      await login(email, password);
      const match = document.cookie.match(
        new RegExp(`${LANG_COOKIE}=([^;]+)`),
      );
      const lang =
        match && (LANGS as readonly string[]).includes(match[1])
          ? match[1]
          : DEFAULT_LANG;
      router.push(`/v1/${lang}/feed`);
    } catch (err) {
      const exc = (err as { exc?: string; field?: string; msg?: string }).exc;
      const field = (err as { field?: string }).field;
      const msg = (err as { msg?: string }).msg;
      if (field) {
        setFieldErrors({ [field]: msg ?? t.errors.loginFailed });
      } else {
        setFieldErrors({ form: t.errors.loginFailed });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">{t.form.login.title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="login-email-input" className="text-muted text-xs font-medium">
            {t.form.login.emailLabel}
          </label>
          <input
            id="login-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.form.login.emailPlaceholder}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="login-email"
          />
          {fieldErrors.email && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="login-password-input" className="text-muted text-xs font-medium">
            {t.form.login.passwordLabel}
          </label>
          <input
            id="login-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="login-password"
          />
          {fieldErrors.password && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <Link
          href={RESET_PASSWORD_PATH}
          className="text-muted -mt-1 text-xs underline hover:text-brand"
        >
          {t.form.login.forgotPassword}
        </Link>

        {fieldErrors.form && (
          <p className="text-sm text-red-600" data-testid="login-error">
            {fieldErrors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg w-full rounded px-4 py-2 text-sm disabled:opacity-40"
          data-testid="login-submit"
        >
          {submitting ? t.form.login.submitting : t.form.login.submit}
        </button>
      </form>

      <p className="text-muted text-xs">
        {t.form.login.noAccount}{" "}
        <Link href={REGISTER_PATH} className="text-brand underline">
          {t.form.login.registerLink}
        </Link>
      </p>
    </div>
  );
}
