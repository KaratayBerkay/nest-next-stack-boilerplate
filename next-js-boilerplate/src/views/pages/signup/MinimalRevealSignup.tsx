"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";

const LINK_URL = "#" as const;

function handleEmailContinue(
  event: FormEvent<HTMLFormElement>,
  setRevealed: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setRevealed(true);
}

function handleSubmit(
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

export function MinimalRevealSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.length > 0 && password.length > 0 && agreed;

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
              <IconCircleCheck size={20} aria-hidden="true" />
            </span>
            <h2 className="text-fg text-xl font-semibold tracking-tight">
              {su.signup5SuccessTitle}
            </h2>
            <p className="text-muted text-sm">
              {su.signup5SuccessBody}{" "}
              <span className="text-fg font-medium">{email}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmitted(false);
                setRevealed(false);
                setAgreed(false);
              }}
            >
              {su.signup5ResetAction}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 text-center">
              <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                {su.signup5Eyebrow}
              </span>
              <h2 className="text-fg text-2xl font-semibold tracking-tight">
                {su.signup5Heading}
              </h2>
              <p className="text-muted text-sm">{su.signup5Subheading}</p>
            </div>

            {!revealed ? (
              <form
                onSubmit={(event) => handleEmailContinue(event, setRevealed)}
                className="flex flex-col gap-3"
              >
                <Label htmlFor="signup5-email" required className="sr-only">
                  {su.signup5EmailLabel}
                </Label>
                <Input
                  id="signup5-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={su.signup5EmailPlaceholder}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!email.includes("@")}
                >
                  {su.signup5ContinueAction}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(event) =>
                  handleSubmit(event, agreed, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-4"
              >
                <div className="border-border bg-surface flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <span className="text-fg truncate text-sm">
                    {su.signup5CreatingForLabel}{" "}
                    <span className="font-medium">{email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevealed(false)}
                    className="text-brand shrink-0 text-xs font-medium hover:underline"
                  >
                    {su.signup5ChangeEmailAction}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup5-name" required>
                    {su.signup5NameLabel}
                  </Label>
                  <Input
                    id="signup5-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={su.signup5NamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup5-password" required>
                    {su.signup5PasswordLabel}
                  </Label>
                  <Input
                    id="signup5-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={su.signup5PasswordPlaceholder}
                  />
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="signup5-terms"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    required
                  />
                  <label
                    htmlFor="signup5-terms"
                    className="text-muted text-sm leading-relaxed"
                  >
                    {su.signup5TermsPrefix}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup5TermsAgreement}
                    </a>{" "}
                    {su.signup5TermsAnd}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup5TermsPrivacy}
                    </a>
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                  disabled={!canSubmit}
                >
                  {su.signup5Submit}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
