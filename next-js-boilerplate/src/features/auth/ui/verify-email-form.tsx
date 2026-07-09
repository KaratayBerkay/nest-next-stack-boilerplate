"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LOGIN_PATH } from "@/constants/routes";
import { AUTH_VERIFY_EMAIL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
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

    fetch(AUTH_VERIFY_EMAIL_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          return res.json().then((body) => {
            setStatus("error");
            setErrorMsg(body.msg ?? t.errors.verifyEmailFailed);
          });
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg(t.errors.verifyEmailFailed);
      });
  }, [token, t]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.verifyEmail.title}
      </h2>

      {status === "verifying" && (
        <p className="text-muted text-sm">
          {t.form.verifyEmail.verifying}
        </p>
      )}

      {status === "success" && (
        <>
          <p className="text-sm text-green-600">
            {t.form.verifyEmail.success}
          </p>
          <Link href={LOGIN_PATH} className="text-brand underline text-sm">
            {t.form.verifyEmail.loginLink}
          </Link>
        </>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
