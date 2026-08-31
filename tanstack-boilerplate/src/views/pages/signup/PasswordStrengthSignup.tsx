"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconCircle, IconCircleCheck } from "@tabler/icons-react";
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
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";

const LINK_URL = "#" as const;

interface Requirement {
  id: string;
  labelKey: string;
  test: (value: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  {
    id: "length",
    labelKey: "signup6ReqLength",
    test: (value) => value.length >= 8,
  },
  {
    id: "uppercase",
    labelKey: "signup6ReqUppercase",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    labelKey: "signup6ReqNumber",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "symbol",
    labelKey: "signup6ReqSymbol",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

function strengthMeta(score: number): {
  labelKey: string;
  textClass: string;
} {
  if (score >= 4)
    return { labelKey: "signup6StrengthStrong", textClass: "text-success" };
  if (score >= 3)
    return { labelKey: "signup6StrengthGood", textClass: "text-info" };
  if (score >= 1)
    return { labelKey: "signup6StrengthFair", textClass: "text-warning" };
  return { labelKey: "signup6StrengthWeak", textClass: "text-error" };
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  canSubmit: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (!canSubmit) return;
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
  }, 700);
}

export function PasswordStrengthSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const satisfied = REQUIREMENTS.filter((req) => req.test(password));
  const score = password.length === 0 ? 0 : satisfied.length;
  const meta = strengthMeta(score);
  const allRequirementsMet = satisfied.length === REQUIREMENTS.length;
  const canSubmit =
    name.length > 0 && email.includes("@") && allRequirementsMet && agreed;

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{su.signup6Title}</CardTitle>
          <CardDescription>{su.signup6Description}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {su.signup6SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {su.signup6SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setAgreed(false);
                }}
              >
                {su.signup6ResetAction}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, canSubmit, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup6-name" required>
                  {su.signup6NameLabel}
                </Label>
                <Input
                  id="signup6-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={su.signup6NamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="signup6-email" required>
                  {su.signup6EmailLabel}
                </Label>
                <Input
                  id="signup6-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={su.signup6EmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="signup6-password" required>
                  {su.signup6PasswordLabel}
                </Label>
                <Input
                  id="signup6-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={su.signup6PasswordPlaceholder}
                />
                <div className="flex items-center gap-2">
                  <Progress
                    value={(score / REQUIREMENTS.length) * 100}
                    size="sm"
                    className="flex-1"
                  />
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      password.length === 0 ? "text-muted" : meta.textClass,
                    )}
                  >
                    {password.length === 0
                      ? su.signup6StrengthLabel
                      : su[meta.labelKey]}
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {REQUIREMENTS.map((req) => {
                    const met = req.test(password);
                    return (
                      <li
                        key={req.id}
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          met ? "text-success" : "text-muted",
                        )}
                      >
                        {met ? (
                          <IconCircleCheck
                            size={14}
                            aria-hidden="true"
                            className="shrink-0"
                          />
                        ) : (
                          <IconCircle
                            size={14}
                            aria-hidden="true"
                            className="shrink-0"
                          />
                        )}
                        {su[req.labelKey]}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="signup6-terms"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  required
                />
                <label
                  htmlFor="signup6-terms"
                  className="text-muted text-sm leading-relaxed"
                >
                  {su.signup6TermsPrefix}{" "}
                  <a
                    href={LINK_URL}
                    className="text-fg underline underline-offset-4"
                  >
                    {su.signup6TermsAgreement}
                  </a>{" "}
                  {su.signup6TermsAnd}{" "}
                  <a
                    href={LINK_URL}
                    className="text-fg underline underline-offset-4"
                  >
                    {su.signup6TermsPrivacy}
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
                {su.signup6Submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
