"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconLock,
  IconLockCheck,
  IconLockPassword,
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
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResetPasswordMessages } from "@/types/pages/reset-password/ResetPasswordMessages-types";

interface StrengthLevel {
  labelKey: string;
  textClass: string;
  barClass: string;
}

// Index 0 is the empty/untouched state; 1-4 map to the number of satisfied
// strength criteria (see calculatePasswordStrength).
const STRENGTH_LEVELS: readonly StrengthLevel[] = [
  {
    labelKey: "resetPassword1StrengthEmpty",
    textClass: "text-muted",
    barClass: "bg-border",
  },
  {
    labelKey: "resetPassword1StrengthWeak",
    textClass: "text-error",
    barClass: "bg-error",
  },
  {
    labelKey: "resetPassword1StrengthFair",
    textClass: "text-warning",
    barClass: "bg-warning",
  },
  {
    labelKey: "resetPassword1StrengthGood",
    textClass: "text-brand",
    barClass: "bg-brand",
  },
  {
    labelKey: "resetPassword1StrengthStrong",
    textClass: "text-success",
    barClass: "bg-success",
  },
] as const;

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  const criteria = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const met = criteria.filter(Boolean).length;
  return Math.max(1, met);
}

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

export function CenteredCardResetPassword() {
  const t = useMessages("pages") as unknown as PagesWithResetPasswordMessages;
  const rp = t.resetPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strengthScore = calculatePasswordStrength(newPassword);
  const strength = STRENGTH_LEVELS[strengthScore];
  const mismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconLockPassword size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{rp.resetPassword1Title}</CardTitle>
            <CardDescription>{rp.resetPassword1Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheckFilled size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {rp.resetPassword1SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {rp.resetPassword1SuccessBody}
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
              >
                {rp.resetPassword1ContinueAction}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="rp1-new-password" required>
                  {rp.resetPassword1NewPasswordLabel}
                </Label>
                <Input
                  id="rp1-new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={rp.resetPassword1NewPasswordPlaceholder}
                  leftIcon={<IconLock size={16} aria-hidden="true" />}
                />
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((segment) => (
                      <span
                        key={segment}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          segment < strengthScore
                            ? strength.barClass
                            : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                  <span
                    className={cn("text-xs font-medium", strength.textClass)}
                  >
                    {rp[strength.labelKey]}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="rp1-confirm-password" required>
                  {rp.resetPassword1ConfirmPasswordLabel}
                </Label>
                <Input
                  id="rp1-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={rp.resetPassword1ConfirmPasswordPlaceholder}
                  leftIcon={<IconLockCheck size={16} aria-hidden="true" />}
                  error={mismatch ? rp.resetPassword1MismatchError : undefined}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
                disabled={!canSubmit}
              >
                {rp.resetPassword1Submit}
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
            {rp.resetPassword1BackToLogin}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
