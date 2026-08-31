"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import {
  IconBrandApple,
  IconBrandGithub,
  IconBrandGoogle,
  IconCircleCheck,
  IconMail,
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
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

type ProviderId = "google" | "github" | "apple" | "email";

function handleProviderClick(
  provider: ProviderId,
  setActive: Dispatch<SetStateAction<ProviderId | null>>,
  setConnected: Dispatch<SetStateAction<boolean>>,
) {
  setActive(provider);
  setTimeout(() => {
    setActive(null);
    setConnected(true);
  }, 600);
}

function handleEmailSubmit(
  event: FormEvent<HTMLFormElement>,
  setActive: Dispatch<SetStateAction<ProviderId | null>>,
  setConnected: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  handleProviderClick("email", setActive, setConnected);
}

const SOCIAL_PROVIDERS = [
  {
    id: "google" as const,
    icon: IconBrandGoogle,
    labelKey: "login4GoogleAction",
  },
  {
    id: "github" as const,
    icon: IconBrandGithub,
    labelKey: "login4GithubAction",
  },
  { id: "apple" as const, icon: IconBrandApple, labelKey: "login4AppleAction" },
];

export function SocialButtonsFirstLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState<ProviderId | null>(null);
  const [connected, setConnected] = useState(false);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{lg.login4Title}</CardTitle>
          <CardDescription>{lg.login4Description}</CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <p className="text-fg text-sm font-medium">
                {lg.login4ConnectedMessage}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConnected(false)}
              >
                {lg.login4ResetAction}
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
                    loading={active === provider.id}
                    leftIcon={<provider.icon size={17} aria-hidden="true" />}
                    onClick={() =>
                      handleProviderClick(provider.id, setActive, setConnected)
                    }
                  >
                    {lg[provider.labelKey]}
                  </Button>
                ))}
              </div>
              <Separator label={lg.login4DividerLabel} />
              <form
                onSubmit={(event) =>
                  handleEmailSubmit(event, setActive, setConnected)
                }
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="login4-email" required>
                    {lg.login4EmailLabel}
                  </Label>
                  <Input
                    id="login4-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={lg.login4EmailPlaceholder}
                    leftIcon={<IconMail size={16} aria-hidden="true" />}
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="login4-password" required>
                    {lg.login4PasswordLabel}
                  </Label>
                  <Input
                    id="login4-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={lg.login4PasswordPlaceholder}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={active === "email"}
                >
                  {lg.login4Submit}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="items-center justify-center gap-1.5">
          <span className="text-muted text-sm">{lg.login4SignupPrompt}</span>
          <Link
            href="#"
            className="text-brand text-sm font-medium hover:underline"
          >
            {lg.login4SignupAction}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
