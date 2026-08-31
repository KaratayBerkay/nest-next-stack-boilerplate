"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCircleCheckFilled,
  IconCircleX,
  IconLock,
  IconShieldLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResetPasswordMessages } from "@/types/pages/reset-password/ResetPasswordMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const TIP_ITEM_KEYS = [
  "resetPassword2TipItem1",
  "resetPassword2TipItem2",
] as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
  }, 700);
}

export function SplitImageResetPassword() {
  const t = useMessages("pages") as unknown as PagesWithResetPasswordMessages;
  const rp = t.resetPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showMatchStatus = confirmPassword.length > 0;
  const passwordsMatch = showMatchStatus && confirmPassword === newPassword;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={placeholderImage("reset-password-2-hero", "3x4")}
            alt={rp.resetPassword2ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="from-fg/70 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
            <span className="bg-bg/15 text-bg inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <IconShieldLock size={14} aria-hidden="true" />
              {rp.resetPassword2TipBadge}
            </span>
            <p className="text-bg text-lg leading-snug font-medium">
              {rp.resetPassword2TipText}
            </p>
            <ul className="flex flex-col gap-1.5">
              {TIP_ITEM_KEYS.map((key) => (
                <li
                  key={key}
                  className="text-bg/80 flex items-center gap-2 text-sm"
                >
                  <IconCheck
                    size={14}
                    className="text-bg/60 shrink-0"
                    aria-hidden="true"
                  />
                  {rp[key]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 py-4 lg:py-0 lg:pl-16">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {rp.resetPassword2BackToLogin}
          </Link>

          {submitted ? (
            <div className="flex flex-col gap-4">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheckFilled size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {rp.resetPassword2SuccessTitle}
                </h2>
                <p className="text-muted text-sm">
                  {rp.resetPassword2SuccessBody}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-fit"
              >
                {rp.resetPassword2ContinueAction}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {rp.resetPassword2Title}
                </h2>
                <p className="text-muted text-sm">
                  {rp.resetPassword2Description}
                </p>
              </div>
              <form
                onSubmit={(event) =>
                  handleSubmit(event, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rp2-new-password" required>
                    {rp.resetPassword2NewPasswordLabel}
                  </Label>
                  <Input
                    id="rp2-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder={rp.resetPassword2NewPasswordPlaceholder}
                    leftIcon={<IconLock size={16} aria-hidden="true" />}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rp2-confirm-password" required>
                    {rp.resetPassword2ConfirmPasswordLabel}
                  </Label>
                  <Input
                    id="rp2-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={rp.resetPassword2ConfirmPasswordPlaceholder}
                    leftIcon={<IconLock size={16} aria-hidden="true" />}
                  />
                  {showMatchStatus &&
                    (passwordsMatch ? (
                      <p className="text-success flex items-center gap-1.5 text-xs">
                        <IconCheck size={13} aria-hidden="true" />
                        {rp.resetPassword2MatchSuccess}
                      </p>
                    ) : (
                      <p className="text-error flex items-center gap-1.5 text-xs">
                        <IconCircleX size={13} aria-hidden="true" />
                        {rp.resetPassword2MatchError}
                      </p>
                    ))}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                >
                  {rp.resetPassword2Submit}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
