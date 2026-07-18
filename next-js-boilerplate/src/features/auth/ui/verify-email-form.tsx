"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LOGIN_PATH } from "@/constants/routes";
import { verifyEmailServer } from "@/api/server/auth/verify-email";
import type { VerifyEmailFormProps } from "@/types/auth/VerifyEmailForm-types";

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const t = useMessages("auth");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [errorMsg, setErrorMsg] = useState(
    token ? "" : t.errors.verifyEmailTokenMissing,
  );

  useEffect(() => {
    if (!token) return;

    verifyEmailServer(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMsg(err.message ?? t.errors.verifyEmailFailed);
      });
  }, [token, t]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.verifyEmail.title}
      </h2>

      {status === "verifying" && (
        <p className="text-muted text-sm">{t.form.verifyEmail.verifying}</p>
      )}

      {status === "success" && (
        <>
          <p className="text-sm text-green-600">{t.form.verifyEmail.success}</p>
          <Link href={LOGIN_PATH} className="text-brand text-sm underline">
            {t.form.verifyEmail.loginLink}
          </Link>
        </>
      )}

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
