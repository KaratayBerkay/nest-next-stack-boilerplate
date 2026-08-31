"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCircleCheck,
  IconKey,
  IconLockAccess,
  IconMail,
  IconMailCheck,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InputOTP } from "@/components/ui/InputOTP";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithMagicLinkMessages } from "@/types/pages/magic-link/MagicLinkMessages-types";

type MagicLinkStatus = "idle" | "sent" | "verified";

const OTP_LENGTH = 6 as const;

const FEATURES = [
  { icon: IconShieldCheck, textKey: "magicLink2Feature1" },
  { icon: IconLockAccess, textKey: "magicLink2Feature2" },
  { icon: IconSparkles, textKey: "magicLink2Feature3" },
] as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setStatus: Dispatch<SetStateAction<MagicLinkStatus>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setStatus("sent");
  }, 700);
}

function handleResend(setResent: Dispatch<SetStateAction<boolean>>) {
  setResent(true);
  setTimeout(() => setResent(false), 2000);
}

function handleStartOver(
  setStatus: Dispatch<SetStateAction<MagicLinkStatus>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setOtp: Dispatch<SetStateAction<string>>,
) {
  setStatus("idle");
  setEmail("");
  setOtp("");
}

export function SplitCodeFallbackMagicLink() {
  const t = useMessages("pages") as unknown as PagesWithMagicLinkMessages;
  const ml = t.magicLink;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<MagicLinkStatus>("idle");
  const [otp, setOtp] = useState("");
  const [resent, setResent] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-bg mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border shadow-md lg:grid lg:grid-cols-2">
        <div className="bg-surface relative hidden flex-col justify-between gap-10 overflow-hidden p-10 lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--brand) 30%, transparent) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              maskImage:
                "radial-gradient(ellipse 65% 55% at 25% 15%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 55% at 25% 15%, black, transparent)",
            }}
          />
          <span className="bg-brand/10 text-brand relative flex size-12 items-center justify-center rounded-full">
            <IconKey size={22} aria-hidden="true" />
          </span>
          <div className="relative flex flex-col gap-6">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tight"
            >
              {ml.magicLink2PanelTitle}
            </Typography>
            <ul className="flex flex-col gap-4">
              {FEATURES.map((feature) => (
                <li key={feature.textKey} className="flex items-center gap-3">
                  <span className="border-border bg-bg text-brand flex size-8 shrink-0 items-center justify-center rounded-full border">
                    <feature.icon size={15} aria-hidden="true" />
                  </span>
                  <span className="text-fg text-sm">{ml[feature.textKey]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
          {status === "idle" && (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {ml.magicLink2Title}
                </h2>
                <p className="text-muted text-sm">
                  {ml.magicLink2Description}
                </p>
              </div>
              <form
                onSubmit={(event) =>
                  handleSubmit(event, setSubmitting, setStatus)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ml2-email" required>
                    {ml.magicLink2EmailLabel}
                  </Label>
                  <Input
                    id="ml2-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={ml.magicLink2EmailPlaceholder}
                    leftIcon={<IconMail size={16} aria-hidden="true" />}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                >
                  {ml.magicLink2Submit}
                </Button>
              </form>
            </>
          )}

          {status === "sent" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                  <IconMailCheck size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-fg text-xl font-semibold tracking-tight">
                    {ml.magicLink2SuccessTitle}
                  </h2>
                  <p className="text-muted text-sm">
                    {ml.magicLink2SuccessBody}{" "}
                    <span className="text-fg font-medium">{email}</span>
                  </p>
                </div>
              </div>

              <Separator label={ml.magicLink2OrDivider} />

              <div className="flex flex-col gap-2">
                <p className="text-fg text-sm font-medium">
                  {ml.magicLink2CodeLabel}
                </p>
                <InputOTP value={otp} onChange={setOtp} maxLength={OTP_LENGTH} />
                <p className="text-muted text-xs">{ml.magicLink2CodeHint}</p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={otp.length !== OTP_LENGTH}
                  onClick={() => setStatus("verified")}
                >
                  {ml.magicLink2VerifyAction}
                </Button>
                {resent ? (
                  <p className="text-success flex items-center gap-1.5 text-xs">
                    <IconCircleCheck size={13} aria-hidden="true" />
                    {ml.magicLink2ResendConfirmed}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResend(setResent)}
                    className="text-brand inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                  >
                    <IconRefresh size={13} aria-hidden="true" />
                    {ml.magicLink2ResendAction}
                  </button>
                )}
              </div>
            </div>
          )}

          {status === "verified" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                <IconCircleCheck size={26} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-xl font-semibold tracking-tight">
                  {ml.magicLink2VerifiedTitle}
                </h2>
                <p className="text-muted text-sm">
                  {ml.magicLink2VerifiedBody}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartOver(setStatus, setEmail, setOtp)}
              >
                {ml.magicLink2StartOverAction}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
