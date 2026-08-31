"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconBrandApple,
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

type ProviderId = "google" | "github" | "apple";

const SOCIAL_PROVIDERS = [
  { id: "google" as const, icon: IconBrandGoogle, labelKey: "login9GoogleAction" },
  { id: "github" as const, icon: IconBrandGithub, labelKey: "login9GithubAction" },
  { id: "apple" as const, icon: IconBrandApple, labelKey: "login9AppleAction" },
];

function handleProviderClick(
  provider: ProviderId,
  setActive: Dispatch<SetStateAction<ProviderId | null>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  setActive(provider);
  setTimeout(() => {
    setActive(null);
    setSubmitted(true);
  }, 600);
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

export function ProgressiveSocialLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [active, setActive] = useState<ProviderId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="text-fg text-2xl font-semibold tracking-tight">
            {lg.login9Title}
          </h2>
          <p className="text-muted text-sm">{lg.login9Description}</p>
        </div>

        {submitted ? (
          <p className="bg-success/10 text-success rounded-lg px-4 py-3 text-center text-sm font-medium">
            {lg.login9SuccessMessage}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {SOCIAL_PROVIDERS.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="default"
                  size="lg"
                  className="w-full"
                  loading={active === provider.id}
                  leftIcon={<provider.icon size={18} aria-hidden="true" />}
                  onClick={() =>
                    handleProviderClick(provider.id, setActive, setSubmitted)
                  }
                >
                  {lg[provider.labelKey]}
                </Button>
              ))}
            </div>

            {showEmail ? (
              <form
                onSubmit={(event) =>
                  handleEmailSubmit(event, setSubmitting, setSubmitted)
                }
                className="border-border flex flex-col gap-3 border-t pt-5"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login9-email" required>
                    {lg.login9EmailLabel}
                  </Label>
                  <Input
                    id="login9-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={lg.login9EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login9-password" required>
                    {lg.login9PasswordLabel}
                  </Label>
                  <Input
                    id="login9-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={lg.login9PasswordPlaceholder}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                >
                  {lg.login9Submit}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowEmail(false)}
                  className="text-muted hover:text-fg mx-auto text-xs underline underline-offset-4"
                >
                  {lg.login9HideEmailAction}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="text-muted hover:text-fg mx-auto text-sm underline underline-offset-4"
              >
                {lg.login9UseEmailAction}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
