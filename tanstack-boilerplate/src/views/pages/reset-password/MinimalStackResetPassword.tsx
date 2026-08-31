"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import { IconArrowUpRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResetPasswordMessages } from "@/types/pages/reset-password/ResetPasswordMessages-types";

const UNDERLINE_FIELD =
  "w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-fg placeholder:text-muted/70 transition-colors focus:border-brand focus:ring-0 focus:outline-none";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function MinimalStackResetPassword() {
  const t = useMessages("pages") as unknown as PagesWithResetPasswordMessages;
  const rp = t.resetPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const fieldType = showPasswords ? "text" : "password";

  return (
    <section className="w-full py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-6 text-center">
        <div className="flex flex-col gap-2">
          <Typography variant="overline">
            {rp.resetPassword3Eyebrow}
          </Typography>
          <Typography variant="h3">{rp.resetPassword3Title}</Typography>
          <Typography variant="caption">
            {rp.resetPassword3Description}
          </Typography>
        </div>

        {submitted ? (
          <p className="bg-brand/10 text-brand rounded-full px-5 py-2.5 text-sm font-medium">
            {rp.resetPassword3SuccessMessage}
          </p>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="flex w-full flex-col gap-5 text-left"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="rp3-new-password"
                className="text-fg text-sm font-medium"
              >
                {rp.resetPassword3NewPasswordLabel}
              </label>
              <input
                id="rp3-new-password"
                name="newPassword"
                type={fieldType}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={rp.resetPassword3NewPasswordPlaceholder}
                className={UNDERLINE_FIELD}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="rp3-confirm-password"
                className="text-fg text-sm font-medium"
              >
                {rp.resetPassword3ConfirmPasswordLabel}
              </label>
              <input
                id="rp3-confirm-password"
                name="confirmPassword"
                type={fieldType}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={rp.resetPassword3ConfirmPasswordPlaceholder}
                className={UNDERLINE_FIELD}
              />
              {mismatch && (
                <span className="text-error text-xs">
                  {rp.resetPassword3MismatchError}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-pressed={showPasswords}
              onClick={() => setShowPasswords((value) => !value)}
              className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-xs"
            >
              {showPasswords ? (
                <IconEyeOff size={14} aria-hidden="true" />
              ) : (
                <IconEye size={14} aria-hidden="true" />
              )}
              {showPasswords
                ? rp.resetPassword3HidePasswordsAction
                : rp.resetPassword3ShowPasswordsAction}
            </button>
            <button
              type="submit"
              className="group text-brand mx-auto inline-flex w-fit items-center gap-2 text-sm font-medium"
            >
              {rp.resetPassword3Submit}
              <IconArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </form>
        )}

        <Link
          href="#"
          className="text-muted hover:text-fg text-xs underline underline-offset-4"
        >
          {rp.resetPassword3BackToLogin}
        </Link>
      </div>
    </section>
  );
}
