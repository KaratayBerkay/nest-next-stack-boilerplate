"use client";

import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { REGISTER_PATH, FORGOT_PASSWORD_PATH } from "@/constants/routes";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { loginFormSchema } from "@/validators/auth/schema";
import { Input } from "@/components/ui/Input";
import { InputOTP } from "@/components/ui/input-otp/input-otp";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { User } from "@/features/auth/hooks/useAuth";
import type { MfaMethod } from "@/api/server/auth/login";
import { resendLoginCodeServer } from "@/api/server/auth/mfa";
import { trustDeviceServer } from "@/api/server/sessions/trust-device";

type MfaState = {
  mfaToken: string;
  mfaMethod: MfaMethod;
  user: User;
};

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
  setMfaState: Dispatch<SetStateAction<MfaState | null>>,
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
    const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
    const lang =
      match && (LANGS as readonly string[]).includes(match[1])
        ? match[1]
        : DEFAULT_LANG;
    router.push(`/v1/${lang}/feed`);
  } catch (err) {
    if ((err as Error & { mfaRequired?: boolean }).mfaRequired) {
      setMfaState({
        mfaToken: (err as Error & { mfaToken: string }).mfaToken,
        mfaMethod:
          (err as Error & { mfaMethod: MfaMethod }).mfaMethod ?? "TOTP",
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

async function handleMfaSubmit(
  e: React.SyntheticEvent,
  mfaState: MfaState,
  mfaCode: string,
  trustDevice: boolean,
  setError: Dispatch<SetStateAction<string | null>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  verifyMfa: (mfaToken: string, code: string) => Promise<void>,
  router: ReturnType<typeof useRouter>,
) {
  e.preventDefault();
  setError(null);
  if (!mfaCode || mfaCode.length < 6) {
    setError("Enter your 6-digit code");
    return;
  }
  setSubmitting(true);
  try {
    await verifyMfa(mfaState.mfaToken, mfaCode);
    if (trustDevice) {
      await trustDeviceServer();
    }
    const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
    const lang =
      match && (LANGS as readonly string[]).includes(match[1])
        ? match[1]
        : DEFAULT_LANG;
    router.push(`/v1/${lang}/feed`);
  } catch (err) {
    const msg = (err as { msg?: string }).msg;
    setError(msg ?? "Invalid MFA code");
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
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);

  const schema = loginFormSchema(t.errors);

  const isEmailMethod = mfaState?.mfaMethod === "EMAIL";

  const onResend = useCallback(async () => {
    if (!mfaState) return;
    setResending(true);
    try {
      await resendLoginCodeServer(mfaState.mfaToken);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  }, [mfaState]);

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
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.login.mfaTitle}
        </h2>
        <p className="text-muted text-xs">
          {isEmailMethod
            ? t.form.login.mfaEmailDescription.replace(
                "{email}",
                mfaState.user.email,
              )
            : t.form.login.mfaTotpDescription.replace(
                "{email}",
                mfaState.user.email,
              )}
        </p>

        <form
          onSubmit={(e) =>
            handleMfaSubmit(
              e,
              mfaState,
              mfaCode,
              trustDevice,
              setMfaError,
              setMfaSubmitting,
              verifyMfa,
              router,
            )
          }
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1 text-left">
            <Label htmlFor="mfa-code-input" required>
              {t.form.login.mfaCodeLabel}
            </Label>
            <InputOTP
              id="mfa-code-input"
              maxLength={6}
              value={mfaCode}
              onChange={setMfaCode}
              // Sole field on a freshly-revealed MFA challenge screen, not initial page load.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              data-testid="mfa-code"
            />
          </div>

          {mfaError && (
            <p className="text-sm text-red-600" data-testid="mfa-error">
              {mfaError}
            </p>
          )}

          {isEmailMethod && (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="text-brand text-xs underline disabled:opacity-50"
            >
              {resending
                ? t.form.login.mfaResending
                : t.form.login.mfaResendCode}
            </button>
          )}

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="h-4 w-4"
            />
            Trust this device
          </label>

          <Button
            type="submit"
            disabled={mfaSubmitting}
            className="w-full"
            data-testid="mfa-submit"
          >
            {mfaSubmitting ? t.form.login.mfaVerifying : t.form.login.mfaVerify}
          </Button>
        </form>

        <button
          type="button"
          className="text-muted hover:text-brand text-xs underline"
          onClick={() => {
            setMfaState(null);
            setMfaCode("");
            setMfaError(null);
          }}
        >
          Use a different account
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">{t.form.login.title}</h2>

      <form
        onSubmit={(e) =>
          handleLoginSubmit(
            e,
            schema,
            email,
            password,
            setFieldErrors,
            setSubmitting,
            login,
            router,
            t,
            setMfaState,
          )
        }
        className="flex flex-col gap-3"
      >
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
            <p className="mt-0.5 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <Link
          href={FORGOT_PASSWORD_PATH}
          className="text-muted hover:text-brand -mt-1 text-xs underline"
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
