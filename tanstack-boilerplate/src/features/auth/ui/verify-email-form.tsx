"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LOGIN_PATH } from "@/constants/routes";
import { InputOTP } from "@/components/ui/InputOTP";
import { Button } from "@/components/ui/Button";
import {
  verifyEmailServer,
  verifyEmailCodeServer,
  resendEmailCodeServer,
} from "@/api/server/auth/verify-email";
import type { VerifyEmailFormProps } from "@/types/auth/VerifyEmailForm-types";
import type { I18nMessages } from "@/generated/i18n-messages";

async function handleVerifyCode(
  userId: string,
  code: string,
  setStatus: (s: "idle" | "verifying" | "success" | "error") => void,
  setErrorMsg: (m: string) => void,
  t: I18nMessages["auth"],
) {
  setStatus("verifying");
  try {
    await verifyEmailCodeServer(userId, code);
    setStatus("success");
  } catch (err: unknown) {
    setStatus("error");
    setErrorMsg((err as Error).message ?? t.errors.verifyEmailFailed);
  }
}

async function handleResend(
  userId: string,
  email: string,
  setResending: (r: boolean) => void,
) {
  setResending(true);
  try {
    await resendEmailCodeServer(userId, email);
  } catch {
    // ignore
  } finally {
    setResending(false);
  }
}

export function VerifyEmailForm({
  token,
  userId,
  email,
}: VerifyEmailFormProps) {
  const t = useMessages("auth");

  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >(token ? "verifying" : "idle");
  const [errorMsg, setErrorMsg] = useState(
    token ? "" : t.errors.verifyEmailTokenMissing,
  );
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmailServer(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg((err as Error).message ?? t.errors.verifyEmailFailed);
      });
  }, [token, t]);

  const onVerifyCode = useCallback(
    () => userId && handleVerifyCode(userId, code, setStatus, setErrorMsg, t),
    [userId, code, t],
  );
  const onResend = useCallback(
    () => email && handleResend(userId ?? "", email, setResending),
    [userId, email],
  );

  const hasCodeMode = !token && userId && email;
  const hasTokenMode = !!token;

  if (!hasTokenMode && !hasCodeMode) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.verifyEmail.title}
        </h2>
        <p className="text-error text-sm">{t.errors.verifyEmailTokenMissing}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.verifyEmail.title}
      </h2>

      {hasTokenMode && status === "verifying" && (
        <p className="text-muted text-sm">{t.form.verifyEmail.verifying}</p>
      )}

      {status === "success" && (
        <>
          <p className="text-success text-sm">{t.form.verifyEmail.success}</p>
          <Link href={LOGIN_PATH} className="text-brand text-sm underline">
            {t.form.verifyEmail.loginLink}
          </Link>
        </>
      )}

      {status === "error" && <p className="text-error text-sm">{errorMsg}</p>}

      {hasCodeMode && status !== "success" && (
        <div className="space-y-4">
          <p className="text-muted text-sm">
            {t.form.verifyEmail.codeDescription}
          </p>
          <InputOTP maxLength={6} value={code} onChange={setCode} />
          <div className="flex items-center gap-3">
            <Button onClick={onVerifyCode} disabled={code.length < 6}>
              {t.form.verifyEmail.verify}
            </Button>
            <Button variant="link" onClick={onResend} disabled={resending}>
              {resending
                ? t.form.verifyEmail.resending
                : t.form.verifyEmail.resendCode}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
