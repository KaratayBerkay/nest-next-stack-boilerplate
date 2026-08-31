"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconLock, IconMail } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
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
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

type Step = "email" | "password";

function handleContinue(
  event: FormEvent<HTMLFormElement>,
  setStep: Dispatch<SetStateAction<Step>>,
) {
  event.preventDefault();
  setStep("password");
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

export function TwoStepEmailPasswordLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [lg.login2StepEmailLabel, lg.login2StepPasswordLabel];

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4">
          <StepIndicator
            steps={steps}
            currentStep={step === "email" ? 0 : 1}
            onChange={(index) => {
              if (index === 0) setStep("email");
            }}
          />
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{lg.login2Title}</CardTitle>
            <CardDescription>{lg.login2Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <Alert variant="success">
              <AlertTitle>{lg.login2SuccessTitle}</AlertTitle>
              <AlertDescription>
                {lg.login2SuccessBody} <span className="font-medium">{email}</span>
              </AlertDescription>
            </Alert>
          ) : step === "email" ? (
            <form
              onSubmit={(event) => handleContinue(event, setStep)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="login2-email" required>
                  {lg.login2EmailLabel}
                </Label>
                <Input
                  id="login2-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={lg.login2EmailPlaceholder}
                  description={lg.login2EmailDescription}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!email.includes("@")}
              >
                {lg.login2Continue}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="border-border bg-surface flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <span className="text-fg truncate text-sm">
                  {lg.login2SigningInAsLabel}{" "}
                  <span className="font-medium">{email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-brand shrink-0 text-xs font-medium hover:underline"
                >
                  {lg.login2ChangeEmailAction}
                </button>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="login2-password" required>
                  {lg.login2PasswordLabel}
                </Label>
                <Input
                  id="login2-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={lg.login2PasswordPlaceholder}
                  description={lg.login2PasswordDescription}
                  leftIcon={<IconLock size={16} aria-hidden="true" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {lg.login2Submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
