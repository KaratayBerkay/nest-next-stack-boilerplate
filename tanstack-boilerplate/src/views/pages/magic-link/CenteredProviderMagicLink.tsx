"use client";

import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBrandGmail,
  IconBrandOffice,
  IconBrandYahoo,
  IconClock,
  IconMail,
  IconMailCheck,
  IconWand,
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithMagicLinkMessages } from "@/types/pages/magic-link/MagicLinkMessages-types";

const RESEND_COOLDOWN_SECONDS = 30 as const;

const PROVIDERS = [
  { icon: IconBrandGmail, labelKey: "magicLink1OpenGmail" },
  { icon: IconBrandOffice, labelKey: "magicLink1OpenOutlook" },
  { icon: IconBrandYahoo, labelKey: "magicLink1OpenYahoo" },
] as const;

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

function handleUseAnotherEmail(
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  setSubmitted(false);
  setEmail("");
}

export function CenteredProviderMagicLink() {
  const t = useMessages("pages") as unknown as PagesWithMagicLinkMessages;
  const ml = t.magicLink;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Ticks the resend cooldown down once a link has gone out; gated on
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
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconWand size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{ml.magicLink1Title}</CardTitle>
            <CardDescription>{ml.magicLink1Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="text-fg text-sm font-medium">
                  {ml.magicLink1SuccessTitle}
                </p>
                <p className="text-muted text-sm">
                  {ml.magicLink1SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
              </div>

              <div className="flex w-full flex-col gap-2">
                <span className="text-muted text-xs">
                  {ml.magicLink1OpenProvidersLabel}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDERS.map((provider) => (
                    <Link
                      key={provider.labelKey}
                      href="#"
                      className="border-border bg-surface hover:bg-surface-hover text-fg flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors"
                    >
                      <provider.icon size={18} aria-hidden="true" />
                      {ml[provider.labelKey]}
                    </Link>
                  ))}
                </div>
              </div>

              {resendCooldown > 0 ? (
                <p className="text-muted flex items-center gap-1.5 text-xs">
                  <IconClock size={13} aria-hidden="true" />
                  {`${ml.magicLink1ResendCountdownLabel} 0:${String(
                    resendCooldown,
                  ).padStart(2, "0")}`}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setResendCooldown(RESEND_COOLDOWN_SECONDS)}
                  className="text-brand text-sm font-medium hover:underline"
                >
                  {ml.magicLink1ResendAction}
                </button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUseAnotherEmail(setSubmitted, setEmail)}
              >
                {ml.magicLink1UseAnotherEmail}
              </Button>
            </div>
          ) : (
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
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="ml1-email" required>
                  {ml.magicLink1EmailLabel}
                </Label>
                <Input
                  id="ml1-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={ml.magicLink1EmailPlaceholder}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {ml.magicLink1Submit}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center">
          <Link
            href="#"
            className="text-muted hover:text-brand inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {ml.magicLink1UsePasswordInstead}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
