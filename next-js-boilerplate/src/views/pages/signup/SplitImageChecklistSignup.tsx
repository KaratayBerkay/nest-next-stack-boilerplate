"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "#" as const;

const FEATURE_KEYS = [
  "signup4Feature1",
  "signup4Feature2",
  "signup4Feature3",
  "signup4Feature4",
] as const;

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

export function SplitImageChecklistSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    name.length > 0 && email.includes("@") && password.length > 0 && agreed;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="flex flex-col justify-center gap-6 py-4 lg:order-1 lg:py-0 lg:pr-16">
          {submitted ? (
            <div className="flex flex-col gap-4">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {su.signup4SuccessTitle}
                </h2>
                <p className="text-muted text-sm">
                  {su.signup4SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAgreed(false);
                }}
                className="text-brand w-fit text-sm font-medium hover:underline"
              >
                {su.signup4ResetAction}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {su.signup4Title}
                </h2>
                <p className="text-muted text-sm">{su.signup4Description}</p>
              </div>
              <form
                onSubmit={(event) =>
                  handleSubmit(event, agreed, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup4-name" required>
                    {su.signup4NameLabel}
                  </Label>
                  <Input
                    id="signup4-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={su.signup4NamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup4-email" required>
                    {su.signup4EmailLabel}
                  </Label>
                  <Input
                    id="signup4-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={su.signup4EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup4-password" required>
                    {su.signup4PasswordLabel}
                  </Label>
                  <Input
                    id="signup4-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={su.signup4PasswordPlaceholder}
                  />
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="signup4-terms"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    required
                  />
                  <label
                    htmlFor="signup4-terms"
                    className="text-muted text-sm leading-relaxed"
                  >
                    {su.signup4TermsPrefix}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup4TermsAgreement}
                    </a>{" "}
                    {su.signup4TermsAnd}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup4TermsPrivacy}
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
                  {su.signup4Submit}
                </Button>
              </form>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-muted text-sm">
                  {su.signup4LoginPrompt}
                </span>
                <Link
                  href="#"
                  className="text-brand text-sm font-medium hover:underline"
                >
                  {su.signup4LoginAction}
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="relative hidden min-h-[560px] overflow-hidden rounded-2xl lg:order-2 lg:block">
          <Image
            src={placeholderImage("signup-4-hero", "3x4")}
            alt={su.signup4ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="from-fg/70 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8">
            <div className="flex flex-col gap-1">
              <span className="text-bg/70 text-xs font-semibold tracking-wider uppercase">
                {su.signup4HeroEyebrow}
              </span>
              <p className="text-bg text-xl leading-snug font-medium">
                {su.signup4HeroHeading}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {FEATURE_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <IconCircleCheck
                    size={16}
                    aria-hidden="true"
                    className="text-bg/80 shrink-0"
                  />
                  <span className="text-bg/90 text-sm">{su[key]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
