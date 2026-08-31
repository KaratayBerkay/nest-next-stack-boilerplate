"use client";

import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconArrowLeft,
  IconFingerprint,
  IconLockAccess,
  IconMailCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithMagicLinkMessages } from "@/types/pages/magic-link/MagicLinkMessages-types";

const EXPIRY_SECONDS = 600 as const;

const BENEFITS = [
  { icon: IconShieldCheck, textKey: "magicLink4Benefit1" },
  { icon: IconLockAccess, textKey: "magicLink4Benefit2" },
  { icon: IconFingerprint, textKey: "magicLink4Benefit3" },
] as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setSecondsLeft: Dispatch<SetStateAction<number>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
    setSecondsLeft(EXPIRY_SECONDS);
  }, 700);
}

function handleStartOver(
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  setSubmitted(false);
  setEmail("");
}

export function MutedSecurityPanelMagicLink() {
  const t = useMessages("pages") as unknown as PagesWithMagicLinkMessages;
  const ml = t.magicLink;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Ticks the link-expiry countdown down once a link has gone out; gated on
  // `submitted` so this registers a single long-lived interval instead of
  // re-arming one every second.
  useEffect(() => {
    if (!submitted) return;
    const id = setInterval(() => {
      setSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [submitted]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressValue = (secondsLeft / EXPIRY_SECONDS) * 100;

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <Badge variant="soft" className="w-fit gap-1.5">
            <IconShieldCheck size={14} aria-hidden="true" />
            {ml.magicLink4Badge}
          </Badge>
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tight lg:text-4xl"
            >
              {ml.magicLink4Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {ml.magicLink4Description}
            </Typography>
          </div>
          <ul className="flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.textKey} className="flex items-center gap-3">
                <span className="border-border bg-surface flex size-9 shrink-0 items-center justify-center rounded-full border">
                  <benefit.icon
                    size={16}
                    className="text-brand"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-fg text-sm">{ml[benefit.textKey]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-bg rounded-2xl border p-6 shadow-md lg:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="text-fg text-sm font-medium">
                  {ml.magicLink4SuccessTitle}
                </p>
                <p className="text-muted text-sm">
                  {ml.magicLink4SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
              </div>

              <div className="flex w-full flex-col gap-1.5">
                <Progress value={progressValue} size="sm" />
                <span className="text-muted text-xs tabular-nums">
                  {`${ml.magicLink4ExpiryLabel} ${minutes}:${String(
                    seconds,
                  ).padStart(2, "0")}`}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSecondsLeft(EXPIRY_SECONDS)}
              >
                {ml.magicLink4ResendAction}
              </Button>
              <button
                type="button"
                onClick={() => handleStartOver(setSubmitted, setEmail)}
                className="text-muted hover:text-brand inline-flex items-center gap-1.5 text-xs"
              >
                <IconArrowLeft size={12} aria-hidden="true" />
                {ml.magicLink4StartOverAction}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(
                  event,
                  setSubmitting,
                  setSubmitted,
                  setSecondsLeft,
                )
              }
              className="flex flex-col gap-5"
            >
              <Typography variant="h4">
                {ml.magicLink4PanelHeading}
              </Typography>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ml4-email" required>
                  {ml.magicLink4EmailLabel}
                </Label>
                <Input
                  id="ml4-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={ml.magicLink4EmailPlaceholder}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {ml.magicLink4Submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
