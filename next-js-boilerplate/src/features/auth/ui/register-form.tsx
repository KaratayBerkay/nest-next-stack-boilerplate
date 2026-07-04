"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { registerFormSchema } from "@/lib/validation/auth";

export function RegisterForm() {
  const t = useMessages("auth");
  const { register, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schemas = registerFormSchema(t.errors);

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
      await register(email, password, name || undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken")) {
        setError(t.errors.emailTaken);
      } else {
        setError(t.errors.registerFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">{t.form.register.title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-name-input" className="text-muted text-xs font-medium">
            {t.form.register.nameLabel}
          </label>
          <input
            id="reg-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.form.register.namePlaceholder}
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-name"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reg-email-input" className="text-muted text-xs font-medium">
            {t.form.register.emailLabel}
          </label>
          <input
            id="reg-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="reg-password-input"
            className="text-muted text-xs font-medium"
          >
            {t.form.register.passwordLabel}
          </label>
          <input
            id="reg-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="border-border bg-surface rounded border px-3 py-2 text-sm"
            data-testid="reg-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" data-testid="reg-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
          data-testid="reg-submit"
        >
          {submitting ? t.form.register.submitting : t.form.register.submit}
        </button>
      </form>

      <p className="text-muted text-xs">
        {t.form.register.hasAccount}{" "}
        <Link href={LOGIN_PATH} className="text-brand underline">
          {t.form.register.loginLink}
        </Link>
      </p>
    </div>
  );
}
