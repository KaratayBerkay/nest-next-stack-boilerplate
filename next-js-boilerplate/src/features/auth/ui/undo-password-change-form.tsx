"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { LOGIN_PATH } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { undoPasswordChangeServer } from "@/api/server/auth/undo-password-change";
import type { UndoPasswordChangeFormProps } from "@/types/auth/UndoPasswordChangeForm-types";

async function handleUndoSubmit(
  token: string,
  setError: Dispatch<SetStateAction<string | null>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  t: I18nMessages["auth"],
) {
  setSubmitting(true);
  setError(null);
  try {
    await undoPasswordChangeServer(token);
    setSuccess(true);
    setTimeout(() => router.push(LOGIN_PATH), 2000);
  } catch {
    setError(t.errors.undoPasswordChangeFailed);
  } finally {
    setSubmitting(false);
  }
}

export function UndoPasswordChangeForm({ token }: UndoPasswordChangeFormProps) {
  const t = useMessages("auth");
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.undoPasswordChange.title}
        </h2>
        <p className="text-error text-sm">
          {t.errors.undoPasswordChangeTokenMissing}
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-brand text-sm font-semibold">
          {t.form.undoPasswordChange.title}
        </h2>
        <p className="text-success text-sm">
          {t.form.undoPasswordChange.success}
        </p>
        <Link href={LOGIN_PATH} className="text-brand text-sm underline">
          {t.form.undoPasswordChange.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">
        {t.form.undoPasswordChange.title}
      </h2>
      <p className="text-muted text-sm">
        {t.form.undoPasswordChange.description}
      </p>

      {error && <p className="text-error text-sm">{error}</p>}

      <Button
        variant="destructive"
        disabled={submitting}
        onClick={() =>
          handleUndoSubmit(
            token,
            setError,
            setSubmitting,
            setSuccess,
            router,
            t,
          )
        }
        className="w-full"
      >
        {submitting
          ? t.form.undoPasswordChange.submitting
          : t.form.undoPasswordChange.submit}
      </Button>
    </div>
  );
}
