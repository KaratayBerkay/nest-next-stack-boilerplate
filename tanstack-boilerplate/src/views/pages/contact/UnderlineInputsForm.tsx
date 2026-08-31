"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowUpRight, IconMail, IconPhone } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const PHONE = "+1 (555) 000-0000" as const;
const EMAIL = "hello@acme.com" as const;

const UNDERLINE_FIELD =
  "w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-fg placeholder:text-muted/70 transition-colors focus:border-brand focus:ring-0 focus:outline-none";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function UnderlineInputsForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="flex flex-col gap-6">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter sm:text-5xl lg:text-6xl"
          >
            {co.contact16Title}
            <sup className="text-brand ml-1 text-2xl lg:text-3xl">
              {co.contact16Asterisk}
            </sup>
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.contact16Description}
          </Typography>
          <div className="mt-4 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface flex size-9 items-center justify-center rounded-full border">
                <IconPhone
                  size={15}
                  className="text-muted"
                  aria-hidden="true"
                />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-muted text-sm">
                  {co.contact16PhoneLabel}
                </span>
                <a
                  href={`tel:${PHONE}`}
                  className="text-fg font-medium underline-offset-4 hover:underline"
                >
                  {PHONE}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface flex size-9 items-center justify-center rounded-full border">
                <IconMail size={15} className="text-muted" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-muted text-sm">
                  {co.contact16EmailLabel}
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-fg font-medium underline-offset-4 hover:underline"
                >
                  {EMAIL}
                </a>
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={(event) => handleSubmit(event, setSubmitted)}
          className="flex flex-col gap-7 lg:pt-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="contact16-name"
                className="text-fg text-sm font-medium"
              >
                {co.contact16FormNameLabel}
              </label>
              <input
                id="contact16-name"
                name="name"
                type="text"
                required
                placeholder={co.contact16FormNamePlaceholder}
                className={UNDERLINE_FIELD}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="contact16-email"
                className="text-fg text-sm font-medium"
              >
                {co.contact16FormEmailLabel}
              </label>
              <input
                id="contact16-email"
                name="email"
                type="email"
                required
                placeholder={co.contact16FormEmailPlaceholder}
                className={UNDERLINE_FIELD}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="contact16-message"
                className="text-fg text-sm font-medium"
              >
                {co.contact16FormMessageLabel}
              </label>
              <textarea
                id="contact16-message"
                name="message"
                rows={5}
                required
                placeholder={co.contact16FormMessagePlaceholder}
                className={`${UNDERLINE_FIELD} resize-none`}
              />
            </div>
          </div>
          {submitted ? (
            <p className="bg-brand/10 text-brand rounded-full px-5 py-2.5 text-sm font-medium">
              {co.contact16SubmitSuccess}
            </p>
          ) : (
            <button
              type="submit"
              className="group text-brand inline-flex w-fit items-center gap-2 text-sm font-medium"
            >
              {co.contact16Submit}
              <IconArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
