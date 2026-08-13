"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowRight, IconMail, IconPhone } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const EMAIL = "hello@example.com" as const;
const PHONE = "+1 (555) 012-3456" as const;

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

export function SplitContactFullHeight() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl px-4 lg:grid-cols-2 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden rounded-3xl lg:block">
          <Image
            src="https://picsum.photos/seed/contact32-hero/1200/1600"
            alt={co.contact32ImageAlt}
            fill
            sizes="(max-width: 1024px) 0vw, 50vw"
            className="object-cover"
          />
          <div className="bg-fg/40 absolute inset-0" />
          <div className="text-bg absolute inset-x-0 bottom-0 flex flex-col gap-3 p-10">
            <Typography variant="overline">
              {co.contact32ImageEyebrow}
            </Typography>
            <Typography
              variant="h2"
              className="max-w-md text-4xl font-medium tracking-tighter"
            >
              {co.contact32ImageTitle}
            </Typography>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 py-4 lg:px-10 lg:py-0">
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter"
            >
              {co.contact32FormTitle}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.contact32FormDescription}
            </Typography>
          </div>
          <div className="flex flex-wrap gap-6">
            <a
              href={`mailto:${EMAIL}`}
              className="text-muted hover:text-fg flex items-center gap-2 hover:underline"
            >
              <IconMail size={18} className="text-brand" />
              {EMAIL}
            </a>
            <a
              href={`tel:${PHONE}`}
              className="text-muted hover:text-fg flex items-center gap-2 hover:underline"
            >
              <IconPhone size={18} className="text-brand" />
              {PHONE}
            </a>
          </div>
          {submitted ? (
            <div className="border-border bg-surface rounded-2xl border p-4">
              <Typography
                variant="bodySmall"
                className="text-success font-medium"
              >
                {co.contact32SuccessTitle}
              </Typography>
              <Typography variant="caption">
                {co.contact32SuccessDescription}
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
                  <Label htmlFor="contact32-first-name">
                    {co.contact32FieldFirstNameLabel}
                  </Label>
                  <Input
                    id="contact32-first-name"
                    type="text"
                    required
                    placeholder={co.contact32FieldFirstNamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact32-last-name">
                    {co.contact32FieldLastNameLabel}
                  </Label>
                  <Input
                    id="contact32-last-name"
                    type="text"
                    required
                    placeholder={co.contact32FieldLastNamePlaceholder}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact32-email">
                  {co.contact32FieldEmailLabel}
                </Label>
                <Input
                  id="contact32-email"
                  type="email"
                  required
                  placeholder={co.contact32FieldEmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact32-message">
                  {co.contact32FieldMessageLabel}
                </Label>
                <Textarea
                  id="contact32-message"
                  required
                  placeholder={co.contact32FieldMessagePlaceholder}
                  rows={4}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-full"
                loading={sending}
                rightIcon={sending ? undefined : <IconArrowRight size={16} />}
              >
                {sending ? co.contact32SendingLabel : co.contact32SubmitLabel}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
