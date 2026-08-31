"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCheck,
  IconCircleCheckFilled,
  IconLock,
  IconLockCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResetPasswordMessages } from "@/types/pages/reset-password/ResetPasswordMessages-types";

interface Requirement {
  id: string;
  labelKey: string;
  test: (password: string) => boolean;
}

const REQUIREMENTS: readonly Requirement[] = [
  {
    id: "length",
    labelKey: "resetPassword6RuleLength",
    test: (password) => password.length >= 8,
  },
  {
    id: "case",
    labelKey: "resetPassword6RuleCase",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "number",
    labelKey: "resetPassword6RuleNumber",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    labelKey: "resetPassword6RuleSymbol",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
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

export function RequirementsPanelResetPassword() {
  const t = useMessages("pages") as unknown as PagesWithResetPasswordMessages;
  const rp = t.resetPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allMet = REQUIREMENTS.every((rule) => rule.test(newPassword));
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;
  const mismatch = confirmPassword.length > 0 && !passwordsMatch;
  const steps = [rp.resetPassword6Step1, rp.resetPassword6Step2];

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <Badge variant="soft" className="w-fit gap-1.5">
            <IconShieldLock size={14} aria-hidden="true" />
            {rp.resetPassword6Badge}
          </Badge>
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tight lg:text-4xl"
            >
              {rp.resetPassword6Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {rp.resetPassword6Description}
            </Typography>
          </div>
          <StepIndicator
            steps={steps}
            currentStep={submitted ? 1 : 0}
            onChange={(step) => {
              if (step === 0) setSubmitted(false);
            }}
          />
          <Separator />
          <div className="flex flex-col gap-2.5">
            {REQUIREMENTS.map((rule) => {
              const met = rule.test(newPassword);
              return (
                <div key={rule.id} className="flex items-center gap-3">
                  <span
                    className={
                      met
                        ? "bg-success/10 text-success flex size-7 shrink-0 items-center justify-center rounded-full"
                        : "border-border bg-surface text-muted flex size-7 shrink-0 items-center justify-center rounded-full border"
                    }
                  >
                    {met ? (
                      <IconCheck size={14} aria-hidden="true" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span
                    className={met ? "text-fg text-sm" : "text-muted text-sm"}
                  >
                    {rp[rule.labelKey]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-border bg-bg rounded-2xl border p-6 shadow-md lg:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheckFilled size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {rp.resetPassword6SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {rp.resetPassword6SuccessBody}
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
              >
                {rp.resetPassword6ContinueAction}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-5"
            >
              <Typography variant="h4">
                {rp.resetPassword6PanelHeading}
              </Typography>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp6-new-password" required>
                  {rp.resetPassword6NewPasswordLabel}
                </Label>
                <Input
                  id="rp6-new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={rp.resetPassword6NewPasswordPlaceholder}
                  leftIcon={<IconLock size={16} aria-hidden="true" />}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp6-confirm-password" required>
                  {rp.resetPassword6ConfirmPasswordLabel}
                </Label>
                <Input
                  id="rp6-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={rp.resetPassword6ConfirmPasswordPlaceholder}
                  leftIcon={<IconLockCheck size={16} aria-hidden="true" />}
                  error={mismatch ? rp.resetPassword6MismatchError : undefined}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
                disabled={!allMet || !passwordsMatch}
              >
                {rp.resetPassword6Submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
