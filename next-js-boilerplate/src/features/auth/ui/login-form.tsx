"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { REGISTER_PATH } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { loginFormSchema } from "@/lib/validation/auth";

export function LoginForm() {
  const t = useMessages("auth");
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schemas = loginFormSchema(t.errors);

  if (loading) {
    return <p className="text-muted text-sm">Loading...</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-600">
          Signed in as <strong>{user.email}</strong>
        </p>
        <p className="text-muted text-xs">
          Role: {user.role} &middot; Status: {user.status}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailResult = schemas.email.safeParse(email);
    const passwordResult = schemas.password.safeParse(password);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? t.errors.emailInvalid);
      return;
    }
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0]?.message ?? t.errors.passwordMin);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("credentials") || msg.toLowerCase().includes("email") || msg.toLowerCase().includes("password")) {
        setError(t.errors.loginFailed);
      } else {
        setError(t.errors.loginFailed);
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
        </div>

        {error && (
          <p className="text-sm text-red-600" data-testid="login-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
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
