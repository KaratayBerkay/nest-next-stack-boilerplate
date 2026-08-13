"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const EMAIL = "hello@acme.com" as const;
const PHONE = "+1 (555) 000-0000" as const;
const AVATAR_SRC =
  "https://picsum.photos/seed/contact14-owner/160/160" as const;

const SUCCESS_BOX =
  "rounded-full bg-brand/10 px-5 py-2.5 text-sm font-medium text-brand";

interface Contact14Row {
  key: string;
  labelKey: string;
  value: string;
  href?: string;
}

const DETAIL_ROWS: Contact14Row[] = [
  {
    key: "email",
    labelKey: "contact14EmailLabel",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    key: "phone",
    labelKey: "contact14PhoneLabel",
    value: PHONE,
    href: `tel:${PHONE}`,
  },
  {
    key: "address",
    labelKey: "contact14AddressLabel",
    value: "100 California Street, San Francisco, CA 94111",
  },
  {
    key: "hours",
    labelKey: "contact14HoursLabel",
    value: "Mon – Fri, 9:00am – 5:00pm",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function AvatarQuickForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid gap-10 rounded-3xl border p-6 sm:p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                {co.contact14Label}
              </span>
              <div className="border-border bg-bg w-fit rounded-2xl border p-2">
                <div className="bg-surface rounded-xl p-1.5">
                  <Avatar
                    src={AVATAR_SRC}
                    alt="Alex Rivera"
                    fallback="AR"
                    size="xl"
                    className="size-24 lg:size-28"
                  />
                </div>
              </div>
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tight lg:text-3xl"
              >
                {co.contact14Headline}
              </Typography>
            </div>
            <dl className="flex flex-col gap-4">
              {DETAIL_ROWS.map((row) => (
                <div key={row.key} className="flex flex-col gap-0.5">
                  <dt className="text-muted text-sm">{co[row.labelKey]}</dt>
                  <dd>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="text-fg font-medium underline underline-offset-4"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="text-fg font-medium underline underline-offset-4">
                        {row.value}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="flex flex-col gap-4 lg:pt-10"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact14-name" required>
                  {co.contact14FormNameLabel}
                </Label>
                <Input
                  id="contact14-name"
                  name="name"
                  type="text"
                  required
                  placeholder={co.contact14FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact14-phone" required>
                  {co.contact14FormPhoneLabel}
                </Label>
                <Input
                  id="contact14-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder={co.contact14FormPhonePlaceholder}
                />
              </div>
            </div>
            {submitted ? (
              <p className={SUCCESS_BOX}>{co.contact14SubmitSuccess}</p>
            ) : (
              <button
                type="submit"
                className="bg-brand text-brand-fg hover:bg-brand/90 rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
              >
                {co.contact14Submit}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
