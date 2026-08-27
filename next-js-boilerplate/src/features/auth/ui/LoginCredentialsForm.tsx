"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { REGISTER_PATH, FORGOT_PASSWORD_PATH } from "@/constants/routes";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";
import { loginFormSchema } from "@/validators/auth/schema";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { LoginCredentialsFormProps } from "@/types/auth/LoginForms-types";
import type { MfaState } from "@/types/auth/LoginForm-types";

function getPostLoginLang(): string {
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  return match && (LANGS as readonly string[]).includes(match[1])
    ? match[1]
    : DEFAULT_LANG;
}

async function handleLoginSubmit(
  e: SyntheticEvent,
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
    router.push(`/v1/${getPostLoginLang()}/feed`);
  } catch (err) {
    if ((err as Error & { mfaRequired?: boolean }).mfaRequired) {
      setMfaState({
        mfaToken: (err as Error & { mfaToken: string }).mfaToken,
        mfaMethod:
          (err as Error & { mfaMethod: MfaState["mfaMethod"] }).mfaMethod ??
          "TOTP",
        user: (err as Error & { user: MfaState["user"] }).user,
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

export function LoginCredentialsForm({
  login,
  onMfaRequired,
}: LoginCredentialsFormProps) {
  const t = useMessages("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const schema = loginFormSchema(t.errors);

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
            onMfaRequired,
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
            <p className="text-error mt-0.5 text-xs">{fieldErrors.email}</p>
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
            <p className="text-error mt-0.5 text-xs">{fieldErrors.password}</p>
          )}
        </div>

        <Link
          href={FORGOT_PASSWORD_PATH}
          className="text-muted hover:text-brand -mt-1 text-xs underline"
        >
          {t.form.login.forgotPassword}
        </Link>

        {fieldErrors.form && (
          <p className="text-error text-sm" data-testid="login-error">
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
