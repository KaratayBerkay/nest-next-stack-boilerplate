"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconCircleCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

const BENEFIT_KEYS = [
  "login5Benefit1",
  "login5Benefit2",
  "login5Benefit3",
] as const;

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

export function MutedSplitPanelLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <Badge variant="soft" className="w-fit gap-1.5">
            <IconShieldCheck size={14} aria-hidden="true" />
            {lg.login5Badge}
          </Badge>
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tight lg:text-4xl"
            >
              {lg.login5Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {lg.login5Description}
            </Typography>
          </div>
          <ul className="flex flex-col gap-2.5">
            {BENEFIT_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2.5">
                <IconCircleCheck
                  size={17}
                  className="text-brand shrink-0"
                  aria-hidden="true"
                />
                <span className="text-fg text-sm">{lg[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-bg rounded-2xl border p-6 shadow-md lg:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {lg.login5SuccessTitle}
              </p>
              <p className="text-muted text-sm">
                {lg.login5SuccessBody}{" "}
                <span className="text-fg font-medium">{email}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
              >
                {lg.login5StartOver}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSubmitting, setSubmitted)
              }
              className="flex flex-col gap-5"
            >
              <Typography variant="h4">{lg.login5PanelHeading}</Typography>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<IconBrandGoogle size={16} aria-hidden="true" />}
                >
                  {lg.login5GoogleAction}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<IconBrandGithub size={16} aria-hidden="true" />}
                >
                  {lg.login5GithubAction}
                </Button>
              </div>
              <Separator label={lg.login5DividerLabel} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login5-email" required>
                  {lg.login5EmailLabel}
                </Label>
                <Input
                  id="login5-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={lg.login5EmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login5-password" required>
                  {lg.login5PasswordLabel}
                </Label>
                <Input
                  id="login5-password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={lg.login5PasswordPlaceholder}
                />
              </div>
              <div className="flex items-center justify-between">
                <Switch
                  id="login5-remember"
                  label={lg.login5RememberMe}
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <Link href="#" className="text-brand text-sm hover:underline">
                  {lg.login5ForgotPassword}
                </Link>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={submitting}
              >
                {lg.login5Submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
