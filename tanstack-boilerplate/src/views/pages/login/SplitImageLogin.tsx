"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBrandGoogle,
  IconCircleCheck,
  IconQuote,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

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

export function SplitImageLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={placeholderImage("login-7-hero", "3x4")}
            alt={lg.login7ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="from-fg/60 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
            <IconQuote size={28} className="text-bg/60" aria-hidden="true" />
            <p className="text-bg text-xl font-medium leading-snug">
              {lg.login7QuoteText}
            </p>
            <p className="text-bg/70 text-sm">{lg.login7QuoteAuthor}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 py-4 lg:py-0 lg:pl-16">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {lg.login7BackLink}
          </Link>

          {submitted ? (
            <div className="flex flex-col gap-4">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {lg.login7SuccessTitle}
                </h2>
                <p className="text-muted text-sm">
                  {lg.login7SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-brand w-fit text-sm font-medium hover:underline"
              >
                {lg.login7ResetAction}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-fg text-2xl font-semibold tracking-tight">
                  {lg.login7Title}
                </h2>
                <p className="text-muted text-sm">{lg.login7Description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                leftIcon={<IconBrandGoogle size={16} aria-hidden="true" />}
              >
                {lg.login7GoogleAction}
              </Button>
              <Separator label={lg.login7DividerLabel} />
              <form
                onSubmit={(event) =>
                  handleSubmit(event, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login7-email" required>
                    {lg.login7EmailLabel}
                  </Label>
                  <Input
                    id="login7-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={lg.login7EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login7-password" required>
                    {lg.login7PasswordLabel}
                  </Label>
                  <Input
                    id="login7-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={lg.login7PasswordPlaceholder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Checkbox
                    id="login7-remember"
                    label={lg.login7RememberMe}
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <Link href="#" className="text-brand text-sm hover:underline">
                    {lg.login7ForgotPassword}
                  </Link>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                >
                  {lg.login7Submit}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
