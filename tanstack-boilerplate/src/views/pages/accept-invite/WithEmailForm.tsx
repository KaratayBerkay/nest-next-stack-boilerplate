"use client";

import type { FormEvent } from "react";
import { IconBuilding } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const FOOTER_LINKS = [
  "ai1FooterHelp",
  "ai1FooterPrivacy",
  "ai1FooterTerms",
] as const;

function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function WithEmailForm() {
  const t = useMessages("pages").acceptInvite;

  return (
    <section className="flex w-full flex-col py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-3 md:mb-12">
          <div className="bg-brand flex size-9 items-center justify-center rounded-xl">
            <IconBuilding size={20} className="text-brand-fg" />
          </div>
          <Typography variant="bodyLarge" className="font-semibold">
            {t.ai1LogoName}
          </Typography>
        </div>

        <div className="border-border bg-surface w-full rounded-2xl border p-6 md:p-10 lg:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex w-full gap-3"
              >
                <GoogleIcon />
                {t.ai1GoogleButton}
              </Button>

              <div className="flex items-center gap-4 py-1">
                <Separator className="flex-1" />
                <Typography variant="caption" className="text-muted">
                  {t.ai1Or}
                </Typography>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Typography variant="caption" className="text-muted">
                  {t.ai1EmailLabel}
                </Typography>
                <Input
                  type="email"
                  name="email"
                  placeholder={t.ai1EmailPlaceholder}
                  required
                />
                <Button type="submit" className="w-full">
                  {t.ai1ContinueButton}
                </Button>
              </form>

              <Typography
                variant="caption"
                className="text-muted mt-2 leading-relaxed"
              >
                {t.ai1Disclaimer}
              </Typography>
            </div>

            <div className="flex flex-col justify-center gap-5">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {t.ai1WelcomeHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.ai1WelcomeParagraph1}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.ai1WelcomeParagraph2}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.ai1WelcomeParagraph3}
              </Typography>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              className="text-muted hover:text-fg text-xs transition-colors"
            >
              {t[link]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
