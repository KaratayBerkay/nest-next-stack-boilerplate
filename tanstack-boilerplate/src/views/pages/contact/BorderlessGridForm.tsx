"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const EMAIL = "hello@atelier.com" as const;

const ADDRESS_LINES = [
  "Lark Street 100",
  "San Francisco, CA 94103",
  "United States",
] as const;

const SERVICE_OPTIONS = [
  "contact20FormServiceOption1",
  "contact20FormServiceOption2",
  "contact20FormServiceOption3",
] as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function BorderlessGridForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-xl flex-col gap-4">
            <p className="text-brand text-xs font-semibold tracking-widest uppercase">
              {co.contact20Eyebrow}
            </p>
            <h2 className="text-4xl font-medium tracking-tighter md:text-5xl">
              {co.contact20Title}
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-muted text-xs font-semibold tracking-widest uppercase">
              {co.contact20AddressLabel}
            </p>
            <div className="flex flex-col gap-1">
              {ADDRESS_LINES.map((line) => (
                <p key={line} className="text-muted text-sm">
                  {line}
                </p>
              ))}
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="text-2xl font-medium tracking-tight underline underline-offset-8 md:text-3xl"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        {submitted ? (
          <div
            key="contact20-success"
            className="border-border bg-surface mt-20 flex flex-col items-start gap-4 rounded-3xl border p-10"
          >
            <span className="bg-success/10 flex size-12 items-center justify-center rounded-full">
              <IconCheck className="text-success size-5" />
            </span>
            <h3 className="text-2xl font-medium tracking-tight">
              {co.contact20SuccessTitle}
            </h3>
            <p className="text-muted max-w-md">
              {co.contact20SuccessDescription}
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="mt-20 flex flex-col gap-10"
          >
            <div className="grid gap-10 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact20-name"
                  className="text-muted text-xs font-semibold tracking-widest uppercase"
                >
                  {co.contact20FormNameLabel}
                </label>
                <div className="border-border border-b pb-2">
                  <input
                    id="contact20-name"
                    name="name"
                    type="text"
                    required
                    placeholder={co.contact20FormNamePlaceholder}
                    className="placeholder:text-muted/60 text-fg w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact20-email"
                  className="text-muted text-xs font-semibold tracking-widest uppercase"
                >
                  {co.contact20FormEmailLabel}
                </label>
                <div className="border-border border-b pb-2">
                  <input
                    id="contact20-email"
                    name="email"
                    type="email"
                    required
                    placeholder={co.contact20FormEmailPlaceholder}
                    className="placeholder:text-muted/60 text-fg w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact20-phone"
                  className="text-muted text-xs font-semibold tracking-widest uppercase"
                >
                  {co.contact20FormPhoneLabel}
                </label>
                <div className="border-border border-b pb-2">
                  <input
                    id="contact20-phone"
                    name="phone"
                    type="tel"
                    placeholder={co.contact20FormPhonePlaceholder}
                    className="placeholder:text-muted/60 text-fg w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-3">
                <label
                  htmlFor="contact20-service"
                  className="text-muted text-xs font-semibold tracking-widest uppercase"
                >
                  {co.contact20FormServiceLabel}
                </label>
                <div className="border-border border-b pb-2">
                  <select
                    id="contact20-service"
                    name="service"
                    required
                    defaultValue=""
                    className="text-muted w-full cursor-pointer bg-transparent text-sm focus:outline-none"
                  >
                    <option value="" disabled>
                      {co.contact20FormServicePlaceholder}
                    </option>
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {co[option]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-10 md:col-span-3 md:flex-row md:items-end md:gap-8">
                <Button
                  type="submit"
                  variant="ghost"
                  className="text-brand !rounded-full px-6"
                >
                  {co.contact20FormSubmit}
                  <IconArrowRight className="size-4" />
                </Button>
                <div className="flex w-full flex-col gap-2">
                  <label
                    htmlFor="contact20-message"
                    className="text-muted text-xs font-semibold tracking-widest uppercase"
                  >
                    {co.contact20FormMessageLabel}
                  </label>
                  <div className="border-border border-b pb-2">
                    <textarea
                      id="contact20-message"
                      name="message"
                      required
                      rows={5}
                      placeholder={co.contact20FormMessagePlaceholder}
                      className="placeholder:text-muted/60 text-fg w-full resize-none bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
