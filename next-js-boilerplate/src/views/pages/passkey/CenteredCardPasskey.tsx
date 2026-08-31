"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconFingerprint,
  IconHeadset,
  IconLockPassword,
  IconShieldCheck,
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
import { Separator } from "@/components/ui/Separator";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPasskeyMessages } from "@/types/pages/passkey/PasskeyMessages-types";

type PasskeyStatus = "idle" | "scanning" | "success";
type PasskeyMode = "passkey" | "password";

function handlePasskeyScan(setStatus: Dispatch<SetStateAction<PasskeyStatus>>) {
  setStatus("scanning");
  setTimeout(() => {
    setStatus("success");
  }, 900);
}

function handlePasswordSubmit(
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

export function CenteredCardPasskey() {
  const t = useMessages("pages") as unknown as PagesWithPasskeyMessages;
  const pk = t.passkey;

  const [mode, setMode] = useState<PasskeyMode>("passkey");
  const [status, setStatus] = useState<PasskeyStatus>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwSubmitted, setPwSubmitted] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconFingerprint size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{pk.passkey1Title}</CardTitle>
            <CardDescription>{pk.passkey1Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {mode === "password" ? (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setMode("passkey")}
                className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-xs"
              >
                <IconArrowLeft size={12} aria-hidden="true" />
                {pk.passkey1BackToPasskeyAction}
              </button>
              {pwSubmitted ? (
                <p className="bg-success/10 text-success rounded-full px-4 py-2.5 text-center text-sm font-medium">
                  {pk.passkey1PasswordSuccess}
                </p>
              ) : (
                <form
                  onSubmit={(event) =>
                    handlePasswordSubmit(event, setPwSubmitting, setPwSubmitted)
                  }
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pk1-email" required>
                      {pk.passkey1EmailLabel}
                    </Label>
                    <Input
                      id="pk1-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={pk.passkey1EmailPlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pk1-password" required>
                      {pk.passkey1PasswordLabel}
                    </Label>
                    <Input
                      id="pk1-password"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={pk.passkey1PasswordPlaceholder}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={pwSubmitting}
                  >
                    {pk.passkey1PasswordSubmit}
                  </Button>
                </form>
              )}
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                <IconShieldCheck size={26} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-fg text-sm font-medium">
                  {pk.passkey1SuccessTitle}
                </p>
                <p className="text-muted text-sm">
                  {pk.passkey1SuccessBody}{" "}
                  <span className="text-fg font-medium">
                    {pk.passkey1MockUserName}
                  </span>
                </p>
                <p className="text-muted text-xs">{pk.passkey1MockUserEmail}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatus("idle")}
              >
                {pk.passkey1ResetAction}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex size-16 items-center justify-center">
                  {status === "scanning" && (
                    <span
                      className="bg-brand/20 absolute inset-0 animate-ping rounded-full motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "border-border bg-surface text-muted relative flex size-16 items-center justify-center rounded-full border transition-colors",
                      status === "scanning" && "border-brand text-brand",
                    )}
                  >
                    {status === "scanning" ? (
                      <Spinner size="lg" />
                    ) : (
                      <IconFingerprint size={28} aria-hidden="true" />
                    )}
                  </span>
                </div>
                <p className="text-muted text-xs">
                  {status === "scanning"
                    ? pk.passkey1ScanningHint
                    : pk.passkey1IdleHint}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={status === "scanning"}
                onClick={() => handlePasskeyScan(setStatus)}
              >
                {pk.passkey1ContinueAction}
              </Button>
              <Separator label={pk.passkey1OrDivider} />
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                leftIcon={<IconLockPassword size={16} aria-hidden="true" />}
                onClick={() => setMode("password")}
              >
                {pk.passkey1PasswordFallbackAction}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center gap-1.5">
          <IconHeadset size={14} className="text-muted" aria-hidden="true" />
          <span className="text-muted text-xs">{pk.passkey1SupportLabel}</span>
          <Link
            href="#"
            className="text-brand text-xs font-medium hover:underline"
          >
            {pk.passkey1SupportContact}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
