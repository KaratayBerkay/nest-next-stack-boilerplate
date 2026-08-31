"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconListCheck,
  IconLock,
  IconLockCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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
    labelKey: "resetPassword4RuleLength",
    test: (password) => password.length >= 8,
  },
  {
    id: "case",
    labelKey: "resetPassword4RuleCase",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "number",
    labelKey: "resetPassword4RuleNumber",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    labelKey: "resetPassword4RuleSymbol",
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

export function RequirementsChecklistResetPassword() {
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

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="default" className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
              <IconListCheck size={20} aria-hidden="true" />
            </span>
            <CardTitle className="text-lg">
              {rp.resetPassword4Title}
            </CardTitle>
          </div>
          <CardDescription>{rp.resetPassword4Description}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheckFilled size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {rp.resetPassword4SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {rp.resetPassword4SuccessBody}
              </p>
              <Button type="button" variant="primary" size="sm" className="w-full">
                {rp.resetPassword4ContinueAction}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp4-new-password" required>
                  {rp.resetPassword4NewPasswordLabel}
                </Label>
                <Input
                  id="rp4-new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={rp.resetPassword4NewPasswordPlaceholder}
                  leftIcon={<IconLock size={16} aria-hidden="true" />}
                />
              </div>
              <ul className="flex flex-col gap-1.5">
                {REQUIREMENTS.map((rule) => {
                  const met = rule.test(newPassword);
                  return (
                    <li
                      key={rule.id}
                      className={
                        met
                          ? "text-success flex items-center gap-2 text-xs"
                          : "text-muted flex items-center gap-2 text-xs"
                      }
                    >
                      {met ? (
                        <IconCircleCheckFilled
                          size={14}
                          aria-hidden="true"
                        />
                      ) : (
                        <IconCircleDashed size={14} aria-hidden="true" />
                      )}
                      {rp[rule.labelKey]}
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rp4-confirm-password" required>
                  {rp.resetPassword4ConfirmPasswordLabel}
                </Label>
                <Input
                  id="rp4-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder={rp.resetPassword4ConfirmPasswordPlaceholder}
                  leftIcon={<IconLockCheck size={16} aria-hidden="true" />}
                  error={mismatch ? rp.resetPassword4MismatchError : undefined}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
                disabled={!allMet || !passwordsMatch}
              >
                {rp.resetPassword4Submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
