"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconHeadset,
  IconMailCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Typography } from "@/components/ui/Typography";
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

export function MutedPanelForgotPassword() {
  const t = useMessages("pages") as unknown as PagesWithForgotPasswordMessages;
  const fp = t.forgotPassword;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [fp.forgotPassword4Step1, fp.forgotPassword4Step2];

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <Badge variant="soft" className="w-fit gap-1.5">
            <IconShieldCheck size={14} aria-hidden="true" />
            {fp.forgotPassword4Badge}
          </Badge>
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tight lg:text-4xl"
            >
              {fp.forgotPassword4Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {fp.forgotPassword4Description}
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
          <div className="flex items-center gap-3">
            <span className="border-border bg-surface flex size-9 items-center justify-center rounded-full border">
              <IconHeadset
                size={16}
                className="text-muted"
                aria-hidden="true"
              />
            </span>
            <div className="flex flex-col">
              <span className="text-fg text-sm font-medium">
                {fp.forgotPassword4SupportLabel}
              </span>
              <Link href="#" className="text-brand text-sm hover:underline">
                {fp.forgotPassword4SupportContact}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-border bg-bg rounded-2xl border p-6 shadow-md lg:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconMailCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {fp.forgotPassword4SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {fp.forgotPassword4SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
              >
                {fp.forgotPassword4ResendAction}
              </Button>
              <Link
                href="#"
                className="text-muted hover:text-brand inline-flex items-center gap-1.5 text-xs"
              >
                <IconArrowLeft size={12} aria-hidden="true" />
                {fp.forgotPassword4BackToLogin}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-5"
            >
              <Typography variant="h4">
                {fp.forgotPassword4PanelHeading}
              </Typography>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fp4-email" required>
                  {fp.forgotPassword4EmailLabel}
                </Label>
                <Input
                  id="fp4-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={fp.forgotPassword4EmailPlaceholder}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {fp.forgotPassword4Submit}
              </Button>
              <Link
                href="#"
                className="text-muted hover:text-brand mx-auto inline-flex items-center gap-1.5 text-xs"
              >
                <IconArrowLeft size={12} aria-hidden="true" />
                {fp.forgotPassword4BackToLogin}
              </Link>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
