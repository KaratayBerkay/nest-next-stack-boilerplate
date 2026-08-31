"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconBrandGoogle, IconCircleCheck } from "@tabler/icons-react";
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
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

function handleGoogleClick(
  setGoogleLoading: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  setGoogleLoading(true);
  setTimeout(() => {
    setGoogleLoading(false);
    setSubmitted(true);
  }, 700);
}

function handleEmailSubmit(
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

export function GoogleFirstLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-sm">
        <CardHeader className="items-center gap-1.5 text-center">
          <CardTitle className="text-xl">{lg.login6Title}</CardTitle>
          <CardDescription>{lg.login6Description}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {lg.login6SuccessTitle}
              </p>
              <p className="text-muted text-sm">{lg.login6SuccessBody}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
              >
                {lg.login6ResetAction}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                loading={googleLoading}
                leftIcon={<IconBrandGoogle size={18} aria-hidden="true" />}
                onClick={() =>
                  handleGoogleClick(setGoogleLoading, setSubmitted)
                }
              >
                {lg.login6GoogleAction}
              </Button>
              <Separator label={lg.login6DividerLabel} />
              <form
                onSubmit={(event) =>
                  handleEmailSubmit(event, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="login6-email" className="text-muted text-xs">
                    {lg.login6EmailLabel}
                  </Label>
                  <Input
                    id="login6-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={lg.login6EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label
                    htmlFor="login6-password"
                    className="text-muted text-xs"
                  >
                    {lg.login6PasswordLabel}
                  </Label>
                  <Input
                    id="login6-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={lg.login6PasswordPlaceholder}
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  loading={submitting}
                >
                  {lg.login6EmailSubmit}
                </Button>
              </form>
              <Typography variant="caption" className="text-center">
                {lg.login6Terms}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
