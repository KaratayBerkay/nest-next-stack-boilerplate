"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconArrowUpRight,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

const SUCCESS_BOX =
  "rounded-full bg-brand/10 px-5 py-2.5 text-sm font-medium text-brand";

const SUBMIT_BUTTON =
  "rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-brand-fg transition-colors hover:bg-brand/90";

interface Contact9Choice {
  key: string;
  titleKey: string;
  descriptionKey: string;
  linkKey: string;
  icon: Icon;
  href: string;
}

const CHOICES: Contact9Choice[] = [
  {
    key: "chat",
    titleKey: "contact9Choice1Title",
    descriptionKey: "contact9Choice1Description",
    linkKey: "contact9Choice1Link",
    icon: IconMessageCircle,
    href: LINK_URL,
  },
  {
    key: "email",
    titleKey: "contact9Choice2Title",
    descriptionKey: "contact9Choice2Description",
    linkKey: "contact9Choice2Link",
    icon: IconMail,
    href: "mailto:hello@acme.com",
  },
  {
    key: "visit",
    titleKey: "contact9Choice3Title",
    descriptionKey: "contact9Choice3Description",
    linkKey: "contact9Choice3Link",
    icon: IconMapPin,
    href: LINK_URL,
  },
  {
    key: "call",
    titleKey: "contact9Choice4Title",
    descriptionKey: "contact9Choice4Description",
    linkKey: "contact9Choice4Link",
    icon: IconPhone,
    href: "tel:+15550000000",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function FormBesideContactMethods() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <IconMail size={16} className="text-brand" aria-hidden="true" />
            {co.contact9Badge}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.contact9Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.contact9Subtitle}
          </Typography>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6 sm:p-8 lg:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact9-name" required>
                  {co.contact9FormNameLabel}
                </Label>
                <Input
                  id="contact9-name"
                  name="name"
                  type="text"
                  required
                  placeholder={co.contact9FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact9-email" required>
                  {co.contact9FormEmailLabel}
                </Label>
                <Input
                  id="contact9-email"
                  name="email"
                  type="email"
                  required
                  placeholder={co.contact9FormEmailPlaceholder}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact9-company">
                {co.contact9FormCompanyLabel}
              </Label>
              <Input
                id="contact9-company"
                name="company"
                type="text"
                placeholder={co.contact9FormCompanyPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact9-message" required>
                {co.contact9FormMessageLabel}
              </Label>
              <Textarea
                id="contact9-message"
                name="message"
                required
                placeholder={co.contact9FormMessagePlaceholder}
              />
            </div>
            <div className="flex items-start gap-2.5">
              <Checkbox id="contact9-terms" required />
              <label
                htmlFor="contact9-terms"
                className="text-muted text-sm leading-relaxed"
              >
                {co.contact9FormTermsPrefix}{" "}
                <a
                  href={LINK_URL}
                  className="text-fg underline underline-offset-4"
                >
                  {co.contact9FormTermsAgreement}
                </a>{" "}
                {co.contact9FormTermsAnd}{" "}
                <a
                  href={LINK_URL}
                  className="text-fg underline underline-offset-4"
                >
                  {co.contact9FormTermsPrivacy}
                </a>
              </label>
            </div>
            {submitted ? (
              <p className={SUCCESS_BOX}>{co.contact9SubmitSuccess}</p>
            ) : (
              <button type="submit" className={SUBMIT_BUTTON}>
                {co.contact9Submit}
              </button>
            )}
          </form>

          <div className="grid content-start gap-4 sm:grid-cols-2">
            {CHOICES.map((choice) => (
              <div
                key={choice.key}
                className="border-border bg-surface flex flex-col gap-3 rounded-3xl border p-6"
              >
                <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
                  <choice.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {co[choice.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {co[choice.descriptionKey]}
                  </p>
                </div>
                <a
                  href={choice.href}
                  className="text-brand inline-flex w-fit items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                >
                  {co[choice.linkKey]}
                  <IconArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
