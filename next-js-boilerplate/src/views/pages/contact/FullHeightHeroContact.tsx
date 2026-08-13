"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const EMAIL = "hello@example.com" as const;
const PHONE = "+1 (555) 012-3456" as const;
const ADDRESS = "123 Market Street, San Francisco" as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function FullHeightHeroContact() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 lg:min-h-[80vh] lg:px-8">
        {submitted ? (
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter"
            >
              {co.contact30SuccessTitle}
            </Typography>
            <Typography variant="body" className="text-muted mt-3">
              {co.contact30SuccessDescription}
            </Typography>
          </div>
        ) : (
          <div className="grid w-full gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div className="flex flex-col gap-8">
              <Typography
                variant="h1"
                className="text-5xl font-medium tracking-tighter md:text-6xl lg:text-7xl"
              >
                {co.contact30Title}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {co.contact30Description}
              </Typography>
              <div className="flex flex-col gap-5">
                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex items-center gap-4"
                >
                  <span className="border-border bg-surface flex size-12 items-center justify-center rounded-full border shadow-md">
                    <IconMail size={20} className="text-brand" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">
                      {co.contact30EmailLabel}
                    </span>
                    <span className="text-muted group-hover:underline">
                      {EMAIL}
                    </span>
                  </span>
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="group flex items-center gap-4"
                >
                  <span className="border-border bg-surface flex size-12 items-center justify-center rounded-full border shadow-md">
                    <IconPhone size={20} className="text-brand" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">
                      {co.contact30PhoneLabel}
                    </span>
                    <span className="text-muted group-hover:underline">
                      {PHONE}
                    </span>
                  </span>
                </a>
                <div className="flex items-center gap-4">
                  <span className="border-border bg-surface flex size-12 items-center justify-center rounded-full border shadow-md">
                    <IconMapPin size={20} className="text-brand" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">
                      {co.contact30VisitLabel}
                    </span>
                    <span className="text-muted">{ADDRESS}</span>
                  </span>
                </div>
              </div>
            </div>
            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="border-border bg-surface flex h-fit flex-col gap-4 rounded-3xl border p-6 shadow-lg lg:p-8"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact30-name">
                  {co.contact30FormNameLabel}
                </Label>
                <Input
                  id="contact30-name"
                  type="text"
                  required
                  placeholder={co.contact30FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact30-email">
                  {co.contact30FormEmailLabel}
                </Label>
                <Input
                  id="contact30-email"
                  type="email"
                  required
                  placeholder={co.contact30FormEmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact30-phone" className="text-muted">
                  {co.contact30FormPhoneLabel}
                </Label>
                <Input
                  id="contact30-phone"
                  type="tel"
                  placeholder={co.contact30FormPhonePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact30-message">
                  {co.contact30FormMessageLabel}
                </Label>
                <Textarea
                  id="contact30-message"
                  required
                  placeholder={co.contact30FormMessagePlaceholder}
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="mt-2 w-full rounded-full"
              >
                {co.contact30SubmitLabel}
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
