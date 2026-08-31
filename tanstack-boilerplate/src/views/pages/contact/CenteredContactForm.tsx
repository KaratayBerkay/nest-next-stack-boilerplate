"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function CenteredContactForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-2xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
            {co.contact5Title}
          </h2>
          <p className="text-muted max-w-lg leading-relaxed">
            {co.contact5Description}
          </p>
        </div>
        {submitted ? (
          <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-3xl border p-10 text-center">
            <IconCircleCheck size={40} className="text-brand" />
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-medium">{co.contact5Success}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {co.contact5SuccessDescription}
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact5-first-name"
                  className="text-sm font-medium"
                >
                  {co.contact5FirstNameLabel}
                </label>
                <Input
                  id="contact5-first-name"
                  type="text"
                  name="firstName"
                  required
                  placeholder={co.contact5FirstNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact5-last-name"
                  className="text-sm font-medium"
                >
                  {co.contact5LastNameLabel}
                </label>
                <Input
                  id="contact5-last-name"
                  type="text"
                  name="lastName"
                  required
                  placeholder={co.contact5LastNamePlaceholder}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="contact5-email" className="text-sm font-medium">
                  {co.contact5EmailLabel}
                </label>
                <Input
                  id="contact5-email"
                  type="email"
                  name="email"
                  required
                  placeholder={co.contact5EmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact5-phone" className="text-sm font-medium">
                  {co.contact5PhoneLabel}
                </label>
                <Input
                  id="contact5-phone"
                  type="tel"
                  name="phone"
                  placeholder={co.contact5PhonePlaceholder}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact5-company"
                  className="text-sm font-medium"
                >
                  {co.contact5CompanyLabel}
                </label>
                <Input
                  id="contact5-company"
                  type="text"
                  name="company"
                  placeholder={co.contact5CompanyPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact5-job-title"
                  className="text-sm font-medium"
                >
                  {co.contact5JobTitleLabel}
                </label>
                <Input
                  id="contact5-job-title"
                  type="text"
                  name="jobTitle"
                  placeholder={co.contact5JobTitlePlaceholder}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact5-message" className="text-sm font-medium">
                {co.contact5MessageLabel}
              </label>
              <Textarea
                id="contact5-message"
                name="message"
                required
                placeholder={co.contact5MessagePlaceholder}
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-fit sm:px-10"
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {co.contact5Submit}
              </Button>
              <p className="text-muted text-sm">{co.contact5Note}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
