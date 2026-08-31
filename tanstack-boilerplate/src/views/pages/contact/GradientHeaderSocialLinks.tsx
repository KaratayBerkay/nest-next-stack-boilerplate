"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconMail, IconMapPin, IconSend } from "@tabler/icons-react";
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

const SOCIAL_LINK =
  "flex size-10 items-center justify-center rounded-full border border-border text-sm font-semibold transition-colors hover:bg-surface-hover";

const HEADCOUNT_OPTION_KEYS = [
  "contact10FormHeadcountOption1",
  "contact10FormHeadcountOption2",
  "contact10FormHeadcountOption3",
];

interface Contact10Social {
  key: string;
  name: string;
  short: string;
  ariaLabelKey: string;
}

const SOCIALS: Contact10Social[] = [
  { key: "x", name: "X", short: "X", ariaLabelKey: "contact10XAriaLabel" },
  {
    key: "linkedin",
    name: "LinkedIn",
    short: "in",
    ariaLabelKey: "contact10LinkedInAriaLabel",
  },
  {
    key: "github",
    name: "GitHub",
    short: "GH",
    ariaLabelKey: "contact10GitHubAriaLabel",
  },
  {
    key: "youtube",
    name: "YouTube",
    short: "YT",
    ariaLabelKey: "contact10YouTubeAriaLabel",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function GradientHeaderSocialLinks() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface overflow-hidden rounded-3xl border">
          <div className="from-brand/15 via-brand/5 bg-gradient-to-b to-transparent px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {co.contact10Title}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {co.contact10Subtitle}
              </Typography>
            </div>

            <div className="mt-10 grid gap-8 text-center sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2">
                <span className="border-border bg-bg flex size-11 items-center justify-center rounded-full border">
                  <IconMapPin
                    size={20}
                    className="text-brand"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-muted text-sm">
                  {co.contact10AddressLabel}
                </span>
                <span className="text-sm font-medium">{OFFICE_ADDRESS}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="border-border bg-bg flex size-11 items-center justify-center rounded-full border">
                  <IconMail
                    size={20}
                    className="text-brand"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-muted text-sm">
                  {co.contact10EmailLabel}
                </span>
                <a
                  href="mailto:hello@acme.com"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  hello@acme.com
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-muted text-sm">
                  {co.contact10SocialsLabel}
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

            <div
              aria-hidden="true"
              className="border-border mt-10 border-t border-dashed"
            />

            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="mx-auto mt-10 flex w-full max-w-2xl flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact10-name" required>
                    {co.contact10FormNameLabel}
                  </Label>
                  <Input
                    id="contact10-name"
                    name="name"
                    type="text"
                    required
                    placeholder={co.contact10FormNamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact10-email" required>
                    {co.contact10FormEmailLabel}
                  </Label>
                  <Input
                    id="contact10-email"
                    name="email"
                    type="email"
                    required
                    placeholder={co.contact10FormEmailPlaceholder}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact10-company">
                    {co.contact10FormCompanyLabel}
                  </Label>
                  <Input
                    id="contact10-company"
                    name="company"
                    type="text"
                    placeholder={co.contact10FormCompanyPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact10-headcount">
                    {co.contact10FormHeadcountLabel}
                  </Label>
                  <NativeSelect
                    id="contact10-headcount"
                    name="headcount"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {co.contact10FormHeadcountPlaceholder}
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
                <Label htmlFor="contact10-message" required>
                  {co.contact10FormMessageLabel}
                </Label>
                <Textarea
                  id="contact10-message"
                  name="message"
                  required
                  placeholder={co.contact10FormMessagePlaceholder}
                />
              </div>
              <div className="mt-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <Typography variant="caption">
                  {co.contact10FormHelper}
                </Typography>
                {submitted ? (
                  <p className={SUCCESS_BOX}>{co.contact10SubmitSuccess}</p>
                ) : (
                  <button
                    type="submit"
                    className="bg-brand text-brand-fg hover:bg-brand/90 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
                  >
                    <IconSend size={15} aria-hidden="true" />
                    {co.contact10Submit}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
