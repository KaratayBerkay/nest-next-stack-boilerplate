"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

const OFFICE_ADDRESS =
  "100 California Street, San Francisco, CA 94111" as const;

const SUCCESS_BOX =
  "rounded-full bg-brand/10 px-5 py-2.5 text-sm font-medium text-brand";

const HEADCOUNT_OPTION_KEYS = [
  "contact11FormHeadcountOption1",
  "contact11FormHeadcountOption2",
  "contact11FormHeadcountOption3",
];

const SOCIAL_LINK =
  "flex size-10 items-center justify-center rounded-full border border-border text-sm font-semibold transition-colors hover:bg-surface-hover";

interface Contact11Social {
  key: string;
  name: string;
  short: string;
  ariaLabelKey: string;
}

const SOCIALS: Contact11Social[] = [
  { key: "x", name: "X", short: "X", ariaLabelKey: "contact11XAriaLabel" },
  {
    key: "linkedin",
    name: "LinkedIn",
    short: "in",
    ariaLabelKey: "contact11LinkedInAriaLabel",
  },
  {
    key: "instagram",
    name: "Instagram",
    short: "IG",
    ariaLabelKey: "contact11InstagramAriaLabel",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function TwoColumnSocialLinks() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.contact11Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.contact11Subtitle}
          </Typography>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:border-border flex flex-col gap-8 lg:border-r lg:pr-16">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                <IconMapPin
                  size={16}
                  className="text-brand"
                  aria-hidden="true"
                />
                {co.contact11AddressLabel}
              </span>
              <p className="text-muted text-base leading-relaxed">
                {OFFICE_ADDRESS}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted text-sm">
                {co.contact11CareersLabel}
              </span>
              <a
                href="mailto:careers@acme.com"
                className="text-fg w-fit text-base font-medium underline-offset-4 hover:underline"
              >
                careers@acme.com
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted text-sm">
                {co.contact11PressLabel}
              </span>
              <a
                href="mailto:press@acme.com"
                className="text-fg w-fit text-base font-medium underline-offset-4 hover:underline"
              >
                press@acme.com
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-muted text-sm">
                {co.contact11SocialsLabel}
              </span>
              <div className="flex items-center gap-2">
                {SOCIALS.map((social) => (
                  <a
                    key={social.key}
                    href={LINK_URL}
                    aria-label={co[social.ariaLabelKey]}
                    title={social.name}
                    className={SOCIAL_LINK}
                  >
                    {social.short}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="flex w-full flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact11-name" required>
                  {co.contact11FormNameLabel}
                </Label>
                <Input
                  id="contact11-name"
                  name="name"
                  type="text"
                  required
                  placeholder={co.contact11FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact11-email" required>
                  {co.contact11FormEmailLabel}
                </Label>
                <Input
                  id="contact11-email"
                  name="email"
                  type="email"
                  required
                  placeholder={co.contact11FormEmailPlaceholder}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact11-company">
                  {co.contact11FormCompanyLabel}
                </Label>
                <Input
                  id="contact11-company"
                  name="company"
                  type="text"
                  placeholder={co.contact11FormCompanyPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact11-headcount">
                  {co.contact11FormHeadcountLabel}
                </Label>
                <NativeSelect
                  id="contact11-headcount"
                  name="headcount"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {co.contact11FormHeadcountPlaceholder}
                  </option>
                  {HEADCOUNT_OPTION_KEYS.map((option) => (
                    <option key={option} value={option}>
                      {co[option]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact11-message" required>
                {co.contact11FormMessageLabel}
              </Label>
              <Textarea
                id="contact11-message"
                name="message"
                required
                placeholder={co.contact11FormMessagePlaceholder}
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              {submitted ? (
                <p className={SUCCESS_BOX}>{co.contact11SubmitSuccess}</p>
              ) : (
                <button
                  type="submit"
                  className="bg-brand text-brand-fg hover:bg-brand/90 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  {co.contact11Submit}
                  <IconArrowUpRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
