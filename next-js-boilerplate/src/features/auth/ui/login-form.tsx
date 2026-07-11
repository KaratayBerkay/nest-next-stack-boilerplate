"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { REGISTER_PATH, RESET_PASSWORD_PATH } from "@/constants/routes";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { loginFormSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { User } from "@/features/auth/hooks/useAuth";

async function handleLoginSubmit(
  e: React.SyntheticEvent,
  schema: ReturnType<typeof loginFormSchema>,
  email: string,
  password: string,
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  login: (email: string, password: string) => Promise<void>,
  router: ReturnType<typeof useRouter>,
  t: I18nMessages["auth"],
  setMfaState: Dispatch<SetStateAction<{ mfaToken: string; user: User } | null>>,
) {
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
    if ((err as Error & { mfaRequired?: boolean }).mfaRequired) {
      setMfaState({
        mfaToken: (err as Error & { mfaToken: string }).mfaToken,
        user: (err as Error & { user: User }).user,
      });
      return;
    }
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
}

export function LoginForm() {
  const t = useMessages("auth");
  const { login, verifyMfa, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mfaState, setMfaState] = useState<{ mfaToken: string; user: User } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

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

  // MFA challenge form
  if (mfaState) {
    async function handleMfaSubmit(e: React.SyntheticEvent) {
      e.preventDefault();
      setMfaError(null);
      if (!mfaCode || mfaCode.length < 6) {
        setMfaError("Enter your 6-digit code");
        return;
      }
      if (!mfaState) return;
      setMfaSubmitting(true);
      try {
        await verifyMfa(mfaState.mfaToken, mfaCode);
        const match = document.cookie.match(
          new RegExp(`${LANG_COOKIE}=([^;]+)`),
        );
        const lang =
          match && (LANGS as readonly string[]).includes(match[1])
            ? match[1]
            : DEFAULT_LANG;
        router.push(`/v1/${lang}/feed`);
      } catch (err) {
        const msg = (err as { msg?: string }).msg;
        setMfaError(msg ?? "Invalid MFA code");
      } finally {
        setMfaSubmitting(false);
      }
    }

    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">Two-Factor Authentication</h2>
        <p className="text-muted text-xs">
          Enter the 6-digit code from your authenticator app for {mfaState.user.email}.
        </p>

        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-left">
            <Label htmlFor="mfa-code-input" required>
              Authentication code
            </Label>
            <Input
              id="mfa-code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoFocus
              data-testid="mfa-code"
            />
          </div>

          {mfaError && (
            <p className="text-sm text-red-600" data-testid="mfa-error">{mfaError}</p>
          )}

          <Button
            type="submit"
            disabled={mfaSubmitting}
            className="w-full"
            data-testid="mfa-submit"
          >
            {mfaSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <button
          type="button"
          className="text-muted text-xs underline hover:text-brand"
          onClick={() => { setMfaState(null); setMfaCode(""); setMfaError(null); }}
        >
          Use a different account
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">{t.form.login.title}</h2>

      <form onSubmit={(e) => handleLoginSubmit(e, schema, email, password, setFieldErrors, setSubmitting, login, router, t, setMfaState)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="login-email-input" required>
            {t.form.login.emailLabel}
          </Label>
          <Input
            id="login-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.form.login.emailPlaceholder}
            required
            error={fieldErrors.email}
            data-testid="login-email"
          />
          {fieldErrors.email && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="login-password-input" required>
            {t.form.login.passwordLabel}
          </Label>
          <Input
            id="login-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={fieldErrors.password}
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

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          data-testid="login-submit"
        >
          {submitting ? t.form.login.submitting : t.form.login.submit}
        </Button>
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
