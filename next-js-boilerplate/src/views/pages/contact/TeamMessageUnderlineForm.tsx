"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const AUTHOR_NAME = "Sarah Chen" as const;
const AUTHOR_AVATAR_SRC =
  "https://picsum.photos/seed/contact21-author/64/64" as const;

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function TeamMessageUnderlineForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-10">
          <p className="text-lg leading-relaxed first-line:indent-8">
            <span className="text-muted">{co.contact21QuoteStart}</span>{" "}
            <span className="text-fg font-medium">
              {co.contact21QuoteHighlight}
            </span>{" "}
            <span className="text-muted">{co.contact21QuoteEnd}</span>
          </p>
          <div className="flex items-center gap-3">
            <Avatar
              src={AUTHOR_AVATAR_SRC}
              alt={AUTHOR_NAME}
              fallback="SC"
              size="md"
            />
            <div className="flex flex-col">
              <span className="font-medium">{AUTHOR_NAME}</span>
              <span className="text-muted text-sm">
                {co.contact21AuthorRole}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.contact21Heading}
          </h2>
          {submitted ? (
            <div
              key="contact21-success"
              className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-8"
            >
              <h3 className="text-2xl font-medium tracking-tight">
                {co.contact21SuccessTitle}
              </h3>
              <p className="text-muted">{co.contact21SuccessDescription}</p>
            </div>
          ) : (
            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="flex flex-col gap-10"
            >
              <div className="grid gap-10 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact21-name"
                    className="text-muted text-xs font-semibold tracking-widest uppercase"
                  >
                    {co.contact21FormNameLabel}
                  </label>
                  <div className="border-border border-b pb-2">
                    <input
                      id="contact21-name"
                      name="name"
                      type="text"
                      required
                      placeholder={co.contact21FormNamePlaceholder}
                      className="placeholder:text-muted/60 text-fg w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact21-email"
                    className="text-muted text-xs font-semibold tracking-widest uppercase"
                  >
                    {co.contact21FormEmailLabel}
                  </label>
                  <div className="border-border border-b pb-2">
                    <input
                      id="contact21-email"
                      name="email"
                      type="email"
                      required
                      placeholder={co.contact21FormEmailPlaceholder}
                      className="placeholder:text-muted/60 text-fg w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact21-message"
                  className="text-muted text-xs font-semibold tracking-widest uppercase"
                >
                  {co.contact21FormMessageLabel}
                </label>
                <div className="border-border border-b pb-2">
                  <textarea
                    id="contact21-message"
                    name="message"
                    required
                    rows={6}
                    placeholder={co.contact21FormMessagePlaceholder}
                    className="placeholder:text-muted/60 text-fg w-full resize-none bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="default"
                  className="!rounded-none px-8"
                >
                  {co.contact21FormSubmit}
                  <IconArrowUpRight className="size-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
