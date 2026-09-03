"use client";

import {
  useState,
  useCallback,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import { InputOTP } from "@/components/ui/input-otp/input-otp";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { resendLoginCodeServer } from "@/api/server/auth/mfa";
import type { MfaChallengeFormProps } from "@/types/auth/LoginForms-types";
import type { MfaState } from "@/types/auth/LoginForm-types";

async function handleMfaSubmit(
  e: SyntheticEvent,
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
      try {
        const { trustDeviceServer } =
          await import("@/api/server/sessions/trust-device");
        await trustDeviceServer();
      } catch {
        // Non-fatal — login already succeeded; trusting the device is best-effort.
      }
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

async function handleResendCode(
  mfaState: MfaState,
  setMfaState: Dispatch<SetStateAction<MfaState | null>>,
  setResending: Dispatch<SetStateAction<boolean>>,
  setMfaError: Dispatch<SetStateAction<string | null>>,
  setCooldownEnd: Dispatch<SetStateAction<number | null>>,
  setNow: Dispatch<SetStateAction<number>>,
) {
  setResending(true);
  try {
    const { mfaToken } = await resendLoginCodeServer(mfaState.mfaToken);
    setMfaState({ ...mfaState, mfaToken });
    setCooldownEnd(Date.now() + 60000);
    setNow(Date.now());
  } catch {
    setMfaError("Couldn't resend the code — try again");
  } finally {
    setResending(false);
  }
}

function handleUseDifferentAccount(
  onBackToCredentials: () => void,
  setMfaCode: Dispatch<SetStateAction<string>>,
  setMfaError: Dispatch<SetStateAction<string | null>>,
) {
  setMfaCode("");
  setMfaError(null);
  onBackToCredentials();
}

export function MfaChallengeForm({
  mfaState,
  verifyMfa,
  setMfaState,
  onBackToCredentials,
}: MfaChallengeFormProps) {
  const t = useMessages("auth");
  const router = useRouter();
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // Backend's verifyLoginMfa tries TOTP first, falling back to a one-time
  // backup code — but only TOTP has a backup-code recovery path (email OTP
  // doesn't), so the toggle only makes sense for that method.
  const [backupCodeMode, setBackupCodeMode] = useState(false);

  const cooldownRemaining = cooldownEnd
    ? Math.max(0, Math.ceil((cooldownEnd - now) / 1000))
    : 0;

  useEffect(() => {
    if (!cooldownEnd || cooldownRemaining <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownEnd, cooldownRemaining]);

  const isEmailMethod = mfaState.mfaMethod === "EMAIL";

  const onResend = useCallback(() => {
    if (!mfaState) return;
    void handleResendCode(
      mfaState,
      setMfaState,
      setResending,
      setMfaError,
      setCooldownEnd,
      setNow,
    );
  }, [mfaState, setMfaState]);

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.login.mfaTitle}
      </h2>
      <p className="text-muted text-xs">
        {isEmailMethod
          ? t.form.login.mfaEmailDescription.replace("{email}", mfaState.email)
          : t.form.login.mfaTotpDescription.replace("{email}", mfaState.email)}
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
            {backupCodeMode
              ? t.form.login.mfaBackupCodeLabel
              : t.form.login.mfaCodeLabel}
          </Label>
          {backupCodeMode ? (
            <Input
              id="mfa-code-input"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder={t.form.login.mfaBackupCodePlaceholder}
              maxLength={10}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              data-testid="mfa-code"
            />
          ) : (
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
          )}
        </div>

        {mfaError && (
          <p className="text-error text-sm" data-testid="mfa-error">
            {mfaError}
          </p>
        )}

        {!isEmailMethod && (
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => {
              setBackupCodeMode((v) => !v);
              setMfaCode("");
              setMfaError(null);
            }}
          >
            {backupCodeMode
              ? t.form.login.mfaUseCode
              : t.form.login.mfaUseBackupCode}
          </Button>
        )}

        {isEmailMethod && (
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={onResend}
            disabled={resending || cooldownRemaining > 0}
          >
            {cooldownRemaining > 0
              ? `${t.form.login.mfaResendCooldown} ${cooldownRemaining}s`
              : resending
                ? t.form.login.mfaResending
                : t.form.login.mfaResendCode}
          </Button>
        )}

        <label className="flex items-center gap-2 text-xs">
          <Checkbox
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
          />
          {t.form.login.trustDevice}
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

      <Button
        type="button"
        variant="link"
        size="xs"
        className="text-muted hover:text-brand"
        onClick={() =>
          handleUseDifferentAccount(
            onBackToCredentials,
            setMfaCode,
            setMfaError,
          )
        }
      >
        {t.form.login.useDifferentAccount}
      </Button>
    </div>
  );
}
