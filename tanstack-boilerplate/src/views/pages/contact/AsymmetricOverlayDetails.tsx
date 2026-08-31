"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
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

export function AsymmetricOverlayDetails() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-5 lg:gap-8 lg:px-8">
        <div className="relative min-h-[360px] overflow-hidden rounded-3xl sm:min-h-[420px] lg:col-span-3 lg:min-h-0">
          <Image
            src="/img/placeholders/ph-3x2-7.webp"
            alt={co.contact34ImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          <div className="border-border bg-surface/95 absolute inset-x-4 bottom-4 rounded-2xl border p-5 shadow-lg backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Typography variant="overline">
                  {co.contact34EmailLabel}
                </Typography>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm font-medium hover:underline"
                >
                  {EMAIL}
                </a>
              </div>
              <div className="flex flex-col gap-1.5">
                <Typography variant="overline">
                  {co.contact34PhoneLabel}
                </Typography>
                <a
                  href={`tel:${PHONE}`}
                  className="text-sm font-medium hover:underline"
                >
                  {PHONE}
                </a>
              </div>
              <div className="flex flex-col gap-1.5">
                <Typography variant="overline">
                  {co.contact34AddressLabel}
                </Typography>
                <span className="text-sm font-medium">{ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-5 lg:col-span-2">
          <Typography variant="overline">{co.contact34Eyebrow}</Typography>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter"
          >
            {co.contact34Title}
          </Typography>
          {submitted ? (
            <div className="border-border bg-surface flex flex-col gap-2 rounded-2xl border p-5">
              <Typography variant="h4">{co.contact34SuccessTitle}</Typography>
              <Typography variant="bodySmall" className="text-muted">
                {co.contact34SuccessDescription}
              </Typography>
            </div>
          ) : (
            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact34-name" required>
                  {co.contact34FormNameLabel}
                </Label>
                <Input
                  id="contact34-name"
                  type="text"
                  required
                  placeholder={co.contact34FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact34-email" required>
                  {co.contact34FormEmailLabel}
                </Label>
                <Input
                  id="contact34-email"
                  type="email"
                  required
                  placeholder={co.contact34FormEmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact34-message" required>
                  {co.contact34FormMessageLabel}
                </Label>
                <Textarea
                  id="contact34-message"
                  required
                  placeholder={co.contact34FormMessagePlaceholder}
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-2xl sm:w-auto"
                rightIcon={<IconArrowUpRight size={16} />}
              >
                {co.contact34SubmitLabel}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
