"use client";

import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconMail,
  IconMailCheck,
  IconQuote,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithForgotPasswordMessages } from "@/types/pages/forgot-password/ForgotPasswordMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const RESEND_COOLDOWN_SECONDS = 30 as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setResendCooldown: Dispatch<SetStateAction<number>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, 700);
}

function handleResend(setResendCooldown: Dispatch<SetStateAction<number>>) {
  setResendCooldown(RESEND_COOLDOWN_SECONDS);
}

export function SplitImageForgotPassword() {
  const t = useMessages("pages") as unknown as PagesWithForgotPasswordMessages;
  const fp = t.forgotPassword;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Ticks the resend cooldown down once a request has gone out; gated on
  // `submitted` (not the countdown value itself) so this registers a single
  // long-lived interval instead of re-arming one every second.
  useEffect(() => {
    if (!submitted) return;
    const id = setInterval(() => {
      setResendCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [submitted]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={placeholderImage("forgot-password-2-hero", "3x4")}
            alt={fp.forgotPassword2ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="from-fg/60 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
            <IconQuote size={28} className="text-bg/60" aria-hidden="true" />
            <p className="text-bg text-xl font-medium leading-snug">
              {fp.forgotPassword2QuoteText}
            </p>
            <p className="text-bg/70 text-sm">
              {fp.forgotPassword2QuoteAuthor}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 py-4 lg:py-0 lg:pl-16">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {fp.forgotPassword2BackToLogin}
          </Link>

          {submitted ? (
            <div className="flex flex-col gap-4">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {fp.forgotPassword2SuccessTitle}
                </h2>
                <p className="text-muted text-sm">
                  {fp.forgotPassword2SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
              </div>
              {resendCooldown > 0 ? (
                <p className="text-muted flex items-center gap-1.5 text-xs">
                  <IconClock size={13} aria-hidden="true" />
                  {`${fp.forgotPassword2ResendCountdownLabel} 0:${String(
                    resendCooldown,
                  ).padStart(2, "0")}`}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleResend(setResendCooldown)}
                  className="text-brand w-fit text-sm font-medium hover:underline"
                >
                  {fp.forgotPassword2ResendAction}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {fp.forgotPassword2Title}
                </h2>
                <p className="text-muted text-sm">
                  {fp.forgotPassword2Description}
                </p>
              </div>
              <form
                onSubmit={(event) =>
                  handleSubmit(
                    event,
                    setSubmitting,
                    setSubmitted,
                    setResendCooldown,
                  )
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fp2-email" required>
                    {fp.forgotPassword2EmailLabel}
                  </Label>
                  <Input
                    id="fp2-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={fp.forgotPassword2EmailPlaceholder}
                    leftIcon={<IconMail size={16} aria-hidden="true" />}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                >
                  {fp.forgotPassword2Submit}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
