"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconCircleCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";

const LINK_URL = "#" as const;

type ProviderId = "google" | "github";

const SOCIAL_PROVIDERS: { id: ProviderId; icon: Icon; labelKey: string }[] = [
  { id: "google", icon: IconBrandGoogle, labelKey: "signup1GoogleAction" },
  { id: "github", icon: IconBrandGithub, labelKey: "signup1GithubAction" },
];

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

export function CenteredCardSocialSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(
    null,
  );

  const canSubmit = name.length > 0 && email.includes("@") && password.length > 0 && agreed;

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{su.signup1Title}</CardTitle>
          <CardDescription>{su.signup1Description}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {su.signup1SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {su.signup1SuccessBody}{" "}
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
                {su.signup1ResetAction}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                {SOCIAL_PROVIDERS.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    loading={activeProvider === provider.id}
                    leftIcon={<provider.icon size={17} aria-hidden="true" />}
                    onClick={() => {
                      setActiveProvider(provider.id);
                      setTimeout(() => {
                        setActiveProvider(null);
                        setSubmitted(true);
                      }, 600);
                    }}
                  >
                    {su[provider.labelKey]}
                  </Button>
                ))}
              </div>
              <Separator label={su.signup1DividerLabel} />
              <form
                onSubmit={(event) =>
                  handleSubmit(event, agreed, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup1-name" required>
                    {su.signup1NameLabel}
                  </Label>
                  <Input
                    id="signup1-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={su.signup1NamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup1-email" required>
                    {su.signup1EmailLabel}
                  </Label>
                  <Input
                    id="signup1-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={su.signup1EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup1-password" required>
                    {su.signup1PasswordLabel}
                  </Label>
                  <Input
                    id="signup1-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={su.signup1PasswordPlaceholder}
                  />
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="signup1-terms"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    required
                  />
                  <label
                    htmlFor="signup1-terms"
                    className="text-muted text-sm leading-relaxed"
                  >
                    {su.signup1TermsPrefix}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup1TermsAgreement}
                    </a>{" "}
                    {su.signup1TermsAnd}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup1TermsPrivacy}
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
                  {su.signup1Submit}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center gap-1.5">
          <span className="text-muted text-sm">{su.signup1LoginPrompt}</span>
          <Link
            href="#"
            className="text-brand text-sm font-medium hover:underline"
          >
            {su.signup1LoginAction}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
