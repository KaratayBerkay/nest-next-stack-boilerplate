"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowLeft, IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";

const LINK_URL = "#" as const;

function handleAccountContinue(
  event: FormEvent<HTMLFormElement>,
  setStep: Dispatch<SetStateAction<number>>,
) {
  event.preventDefault();
  setStep(1);
}

function handleSecurityContinue(
  event: FormEvent<HTMLFormElement>,
  passwordsMatch: boolean,
  setStep: Dispatch<SetStateAction<number>>,
) {
  event.preventDefault();
  if (!passwordsMatch) return;
  setStep(2);
}

function handleFinalSubmit(
  event: FormEvent<HTMLFormElement>,
  agreed: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (!agreed) return;
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
  }, 700);
}

export function MultiStepWizardSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    su.signup2StepAccountLabel,
    su.signup2StepSecurityLabel,
    su.signup2StepReviewLabel,
  ];
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4">
          <StepIndicator
            steps={steps}
            currentStep={step}
            onChange={(index) => {
              if (index < step) setStep(index);
            }}
          />
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{su.signup2Title}</CardTitle>
            <CardDescription>{su.signup2Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {su.signup2SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {su.signup2SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setAgreed(false);
                }}
              >
                {su.signup2ResetAction}
              </Button>
            </div>
          ) : step === 0 ? (
            <form
              onSubmit={(event) => handleAccountContinue(event, setStep)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup2-name" required>
                  {su.signup2NameLabel}
                </Label>
                <Input
                  id="signup2-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={su.signup2NamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup2-email" required>
                  {su.signup2EmailLabel}
                </Label>
                <Input
                  id="signup2-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={su.signup2EmailPlaceholder}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={name.length === 0 || !email.includes("@")}
              >
                {su.signup2ContinueAction}
              </Button>
            </form>
          ) : step === 1 ? (
            <form
              onSubmit={(event) =>
                handleSecurityContinue(event, passwordsMatch, setStep)
              }
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup2-password" required>
                  {su.signup2PasswordLabel}
                </Label>
                <Input
                  id="signup2-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={su.signup2PasswordPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup2-confirm-password" required>
                  {su.signup2ConfirmPasswordLabel}
                </Label>
                <Input
                  id="signup2-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={su.signup2ConfirmPasswordPlaceholder}
                  error={
                    confirmPassword.length > 0 && !passwordsMatch
                      ? su.signup2PasswordMismatch
                      : undefined
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  leftIcon={<IconArrowLeft size={15} aria-hidden="true" />}
                  onClick={() => setStep(0)}
                >
                  {su.signup2BackAction}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!passwordsMatch}
                >
                  {su.signup2ContinueAction}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(event) =>
                handleFinalSubmit(event, agreed, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted">
                    {su.signup2ReviewNameLabel}
                  </span>
                  <span className="text-fg font-medium">{name}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted">
                    {su.signup2ReviewEmailLabel}
                  </span>
                  <span className="text-fg truncate font-medium">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-brand self-start text-xs font-medium hover:underline"
                >
                  {su.signup2EditAction}
                </button>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="signup2-terms"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  required
                />
                <label
                  htmlFor="signup2-terms"
                  className="text-muted text-sm leading-relaxed"
                >
                  {su.signup2TermsPrefix}{" "}
                  <a
                    href={LINK_URL}
                    className="text-fg underline underline-offset-4"
                  >
                    {su.signup2TermsAgreement}
                  </a>{" "}
                  {su.signup2TermsAnd}{" "}
                  <a
                    href={LINK_URL}
                    className="text-fg underline underline-offset-4"
                  >
                    {su.signup2TermsPrivacy}
                  </a>
                </label>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  leftIcon={<IconArrowLeft size={15} aria-hidden="true" />}
                  onClick={() => setStep(1)}
                >
                  {su.signup2BackAction}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                  disabled={!agreed}
                >
                  {su.signup2Submit}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
