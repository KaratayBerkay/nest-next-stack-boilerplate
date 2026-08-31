"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconChevronUp,
  IconClock,
  IconMail,
  IconShieldCheck,
  IconSparkles,
  IconBolt,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const SUPPORT_EMAIL = "support@acme.com" as const;

const SUCCESS_BOX =
  "rounded-full bg-brand/10 px-5 py-2.5 text-sm font-medium text-brand";

const CORNER = "border-error absolute size-4";

interface Contact18Promise {
  key: string;
  titleKey: string;
  descriptionKey: string;
  icon: Icon;
}

const PROMISES: Contact18Promise[] = [
  {
    key: "around-the-clock",
    titleKey: "contact18Row1Title",
    descriptionKey: "contact18Row1Description",
    icon: IconClock,
  },
  {
    key: "fast-responses",
    titleKey: "contact18Row2Title",
    descriptionKey: "contact18Row2Description",
    icon: IconBolt,
  },
  {
    key: "experts",
    titleKey: "contact18Row3Title",
    descriptionKey: "contact18Row3Description",
    icon: IconShieldCheck,
  },
  {
    key: "proactive",
    titleKey: "contact18Row4Title",
    descriptionKey: "contact18Row4Description",
    icon: IconSparkles,
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function SupportFeaturesCorners() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="flex flex-col gap-10">
          <div className="relative w-fit pt-6 pb-4">
            <span
              aria-hidden="true"
              className={`${CORNER} top-0 left-0 border-t-2 border-l-2`}
            />
            <span
              aria-hidden="true"
              className={`${CORNER} top-0 right-0 border-t-2 border-r-2`}
            />
            <span
              aria-hidden="true"
              className={`${CORNER} bottom-0 left-0 border-b-2 border-l-2`}
            />
            <span
              aria-hidden="true"
              className={`${CORNER} right-0 bottom-0 border-r-2 border-b-2`}
            />
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter sm:text-5xl lg:text-6xl"
            >
              {co.contact18Title}
            </Typography>
          </div>

          <div className="flex flex-col">
            {PROMISES.map((promise, index) => (
              <div
                key={promise.key}
                className={`group flex items-center gap-4 py-4 ${
                  index > 0 ? "border-border border-t" : ""
                }`}
              >
                <span className="bg-error/10 text-error flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <promise.icon size={18} aria-hidden="true" />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <h3 className="text-base font-semibold tracking-tight">
                    {co[promise.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {co[promise.descriptionKey]}
                  </p>
                </div>
                <IconChevronUp
                  size={16}
                  className="text-muted shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-muted text-sm">{co.contact18MailLabel}</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-brand inline-flex w-fit items-center gap-3 text-2xl font-semibold tracking-tight underline-offset-4 hover:underline lg:text-3xl"
            >
              <span className="border-border bg-surface flex size-10 items-center justify-center rounded-lg border">
                <IconMail size={18} aria-hidden="true" />
              </span>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <form
          onSubmit={(event) => handleSubmit(event, setSubmitted)}
          className="border-border bg-surface flex h-fit flex-col gap-4 rounded-3xl border p-6 sm:p-8 lg:p-10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact18-name" required>
                {co.contact18FormNameLabel}
              </Label>
              <Input
                id="contact18-name"
                name="name"
                type="text"
                required
                placeholder={co.contact18FormNamePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact18-phone">
                {co.contact18FormPhoneLabel}
              </Label>
              <Input
                id="contact18-phone"
                name="phone"
                type="tel"
                placeholder={co.contact18FormPhonePlaceholder}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact18-email" required>
              {co.contact18FormEmailLabel}
            </Label>
            <Input
              id="contact18-email"
              name="email"
              type="email"
              required
              placeholder={co.contact18FormEmailPlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact18-message" required>
              {co.contact18FormMessageLabel}
            </Label>
            <Textarea
              id="contact18-message"
              name="message"
              required
              placeholder={co.contact18FormMessagePlaceholder}
            />
          </div>
          {submitted ? (
            <p className={SUCCESS_BOX}>{co.contact18SubmitSuccess}</p>
          ) : (
            <button
              type="submit"
              className="bg-brand text-brand-fg hover:bg-brand/90 mt-2 w-full rounded-full px-6 py-3 text-sm font-medium transition-colors"
            >
              {co.contact18Submit}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
