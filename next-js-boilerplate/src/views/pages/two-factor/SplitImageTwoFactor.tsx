"use client";

import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconMailCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTwoFactorMessages } from "@/types/pages/two-factor/TwoFactorMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const CODE_LENGTH = 6 as const;
const RESEND_COOLDOWN_SECONDS = 30 as const;

function sanitizeCode(raw: string): string {
  return raw.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
}

function handleVerify(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setVerified: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setVerified(true);
  }, 700);
}

export function SplitImageTwoFactor() {
  const t = useMessages("pages") as unknown as PagesWithTwoFactorMessages;
  const tf = t.twoFactor;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );

  // Ticks the resend cooldown down from the moment this screen mounts —
  // driven entirely from setInterval (no synchronous setState as the first
  // statement) so it satisfies react-hooks/set-state-in-effect.
  useEffect(() => {
    const id = setInterval(() => {
      setResendCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={placeholderImage("two-factor-2-hero", "3x4")}
            alt={tf.twoFactor2ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="from-fg/70 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
            <span className="bg-bg/15 text-bg flex size-10 items-center justify-center rounded-full backdrop-blur-sm">
              <IconShieldLock size={18} aria-hidden="true" />
            </span>
            <p className="text-bg text-xl leading-snug font-medium">
              {tf.twoFactor2ImageHeadline}
            </p>
            <p className="text-bg/70 text-sm">{tf.twoFactor2ImageSubtext}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 py-4 lg:py-0 lg:pl-16">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {tf.twoFactor2BackToLogin}
          </Link>

          {verified ? (
            <div className="flex flex-col gap-4">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {tf.twoFactor2SuccessTitle}
                </h2>
                <p className="text-muted text-sm">{tf.twoFactor2SuccessBody}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {tf.twoFactor2Title}
                </h2>
                <p className="text-muted text-sm">
                  {tf.twoFactor2Description}{" "}
                  <span className="text-fg font-medium">
                    {tf.twoFactor2MaskedContact}
                  </span>
                </p>
              </div>
              <form
                onSubmit={(event) =>
                  handleVerify(event, setSubmitting, setVerified)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="tf2-code"
                    className="text-fg text-sm font-medium"
                  >
                    {tf.twoFactor2CodeLabel}
                  </label>
                  <Input
                    id="tf2-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={code}
                    onChange={(event) =>
                      setCode(sanitizeCode(event.target.value))
                    }
                    placeholder={tf.twoFactor2CodePlaceholder}
                    fontSize="text-2xl"
                    className="text-center tracking-[0.5em]"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                  disabled={code.length !== CODE_LENGTH}
                >
                  {tf.twoFactor2Submit}
                </Button>
              </form>

              <div className="flex items-center gap-1.5">
                {resendCooldown > 0 ? (
                  <p className="text-muted flex items-center gap-1.5 text-xs">
                    <IconClock size={13} aria-hidden="true" />
                    {`${tf.twoFactor2ResendCountdownLabel} 0:${String(
                      resendCooldown,
                    ).padStart(2, "0")}`}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendCooldown(RESEND_COOLDOWN_SECONDS)}
                    className="text-brand text-sm font-medium hover:underline"
                  >
                    {tf.twoFactor2ResendAction}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
