"use client";

import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconShieldCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { InputOTP } from "@/components/ui/InputOTP";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTwoFactorMessages } from "@/types/pages/two-factor/TwoFactorMessages-types";

const CODE_LENGTH = 6 as const;
const RESEND_COOLDOWN_SECONDS = 30 as const;

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

function handleStartOver(
  setVerified: Dispatch<SetStateAction<boolean>>,
  setCode: Dispatch<SetStateAction<string>>,
) {
  setVerified(false);
  setCode("");
}

export function CenteredCodeTwoFactor() {
  const t = useMessages("pages") as unknown as PagesWithTwoFactorMessages;
  const tf = t.twoFactor;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
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
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconShieldLock size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{tf.twoFactor1Title}</CardTitle>
            <CardDescription>
              {tf.twoFactor1Description}{" "}
              <span className="text-fg font-medium">
                {tf.twoFactor1MaskedContact}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {verified ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                <IconShieldCheck size={26} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor1SuccessTitle}
                </p>
                <p className="text-muted text-sm">{tf.twoFactor1SuccessBody}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartOver(setVerified, setCode)}
              >
                {tf.twoFactor1StartOverAction}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) => handleVerify(event, setSubmitting, setVerified)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor1CodeLabel}
                </p>
                <InputOTP value={code} onChange={setCode} maxLength={CODE_LENGTH} />
                <p className="text-muted text-xs">{tf.twoFactor1CodeHint}</p>
              </div>

              <Checkbox
                id="tf1-trust-device"
                checked={trustDevice}
                onChange={(event) => setTrustDevice(event.target.checked)}
                label={tf.twoFactor1TrustDeviceLabel}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
                disabled={code.length !== CODE_LENGTH}
              >
                {tf.twoFactor1VerifyAction}
              </Button>

              <div className="flex items-center justify-center">
                {resendCooldown > 0 ? (
                  <p className="text-muted flex items-center gap-1.5 text-xs">
                    <IconClock size={13} aria-hidden="true" />
                    {`${tf.twoFactor1ResendCountdownLabel} 0:${String(
                      resendCooldown,
                    ).padStart(2, "0")}`}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendCooldown(RESEND_COOLDOWN_SECONDS)}
                    className="text-brand text-xs font-medium hover:underline"
                  >
                    {tf.twoFactor1ResendAction}
                  </button>
                )}
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center">
          <Link
            href="#"
            className="text-muted hover:text-brand inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {tf.twoFactor1BackToLogin}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
