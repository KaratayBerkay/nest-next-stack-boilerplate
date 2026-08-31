"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconCircleCheck,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  password: string,
  setError: Dispatch<SetStateAction<boolean>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (password.trim().length === 0) {
    setError(true);
    return;
  }
  setError(false);
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
  }, 700);
}

function handleStartOver(
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setPassword: Dispatch<SetStateAction<string>>,
) {
  setSubmitted(false);
  setPassword("");
}

export function CenteredCardLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconLock size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{lg.login1Title}</CardTitle>
            <CardDescription>{lg.login1Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {lg.login1SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {lg.login1SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartOver(setSubmitted, setPassword)}
              >
                {lg.login1SignOut}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(
                  event,
                  password,
                  setError,
                  setSubmitting,
                  setSubmitted,
                )
              }
              className="flex flex-col gap-4"
            >
              {error && (
                <FormErrorBanner
                  message={lg.login1ErrorMessage}
                  onDismiss={() => setError(false)}
                />
              )}
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="login1-email" required>
                  {lg.login1EmailLabel}
                </Label>
                <Input
                  id="login1-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={lg.login1EmailPlaceholder}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="login1-password" required>
                  {lg.login1PasswordLabel}
                </Label>
                <Input
                  id="login1-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(false);
                  }}
                  placeholder={lg.login1PasswordPlaceholder}
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  id="login1-remember"
                  label={lg.login1RememberMe}
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <Link
                  href="#"
                  className="text-brand text-sm hover:underline"
                >
                  {lg.login1ForgotPassword}
                </Link>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {lg.login1Submit}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center gap-1.5">
          <span className="text-muted text-sm">{lg.login1SignupPrompt}</span>
          <Link href="#" className="text-brand text-sm font-medium hover:underline">
            {lg.login1SignupAction}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
