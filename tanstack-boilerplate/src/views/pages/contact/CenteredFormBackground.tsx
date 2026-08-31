"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSending: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSending(true);
  window.setTimeout(() => {
    setSending(false);
    setSubmitted(true);
  }, 1200);
}

export function CenteredFormBackground() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative flex max-h-[960px] min-h-[80vh] w-full items-center justify-center overflow-hidden py-16 lg:py-24">
      <Image
        src="/img/placeholders/ph-16x9-1.webp"
        alt={co.contact35ImageAlt}
        fill
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="bg-fg/50 absolute inset-0" />
      <div className="relative z-10 mx-auto w-full max-w-xl px-4 lg:px-8">
        <div className="border-border bg-surface/95 flex flex-col gap-6 rounded-3xl border p-6 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter"
            >
              {co.contact35Title}
            </Typography>
            <Typography variant="body" className="text-muted">
              {co.contact35Description}
            </Typography>
          </div>
          {submitted ? (
            <div className="border-border bg-success/10 text-success flex flex-col items-center gap-2 rounded-2xl border p-5 text-center">
              <Typography variant="h4">{co.contact35SuccessTitle}</Typography>
              <Typography variant="bodySmall">
                {co.contact35SuccessDescription}
              </Typography>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleSubmit(event, setSending, setSubmitted)
              }
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact35-name">
                    {co.contact35FormNameLabel}
                  </Label>
                  <Input
                    id="contact35-name"
                    type="text"
                    required
                    placeholder={co.contact35FormNamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact35-email">
                    {co.contact35FormEmailLabel}
                  </Label>
                  <Input
                    id="contact35-email"
                    type="email"
                    required
                    placeholder={co.contact35FormEmailPlaceholder}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact35-phone" className="text-muted">
                  {co.contact35FormPhoneLabel}
                </Label>
                <Input
                  id="contact35-phone"
                  type="tel"
                  placeholder={co.contact35FormPhonePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact35-message" required>
                  {co.contact35FormMessageLabel}
                </Label>
                <Textarea
                  id="contact35-message"
                  required
                  placeholder={co.contact35FormMessagePlaceholder}
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="mt-1 w-full rounded-full"
                loading={sending}
              >
                {sending ? co.contact35SendingLabel : co.contact35SubmitLabel}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
