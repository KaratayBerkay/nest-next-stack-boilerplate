"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLockQuestion,
  IconMail,
  IconMailCheck,
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
import type { PagesWithForgotPasswordMessages } from "@/types/pages/forgot-password/ForgotPasswordMessages-types";

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

function handleUseAnotherEmail(
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  setSubmitted(false);
  setEmail("");
}

export function CenteredCardForgotPassword() {
  const t = useMessages("pages") as unknown as PagesWithForgotPasswordMessages;
  const fp = t.forgotPassword;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconLockQuestion size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{fp.forgotPassword1Title}</CardTitle>
            <CardDescription>{fp.forgotPassword1Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {fp.forgotPassword1SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {fp.forgotPassword1SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUseAnotherEmail(setSubmitted, setEmail)}
              >
                {fp.forgotPassword1ResendAction}
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
                <Label htmlFor="fp1-email" required>
                  {fp.forgotPassword1EmailLabel}
                </Label>
                <Input
                  id="fp1-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={fp.forgotPassword1EmailPlaceholder}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {fp.forgotPassword1Submit}
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
            {fp.forgotPassword1BackToLogin}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
