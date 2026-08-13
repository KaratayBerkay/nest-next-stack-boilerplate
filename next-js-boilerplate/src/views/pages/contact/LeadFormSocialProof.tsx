"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCheck,
  IconFileText,
  IconHelpCircle,
  IconSend,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

const LOGOS = [
  "Acme",
  "Bytewave",
  "Lumina",
  "Nimbus",
  "Quanta",
  "Vertex",
  "Keystone",
  "Zephyr",
] as const;

const BUDGET_OPTION_KEYS = [
  "contact17FormBudgetOption1",
  "contact17FormBudgetOption2",
  "contact17FormBudgetOption3",
  "contact17FormBudgetOption4",
];

const REFERRER_OPTION_KEYS = [
  "contact17FormReferrerOption1",
  "contact17FormReferrerOption2",
  "contact17FormReferrerOption3",
  "contact17FormReferrerOption4",
];

const CHECK_KEYS = [
  "contact17Check1",
  "contact17Check2",
  "contact17Check3",
] as const;

interface Contact17ProofAvatar {
  key: string;
  src: string;
  name: string;
}

const PROOF_AVATARS: Contact17ProofAvatar[] = [
  {
    key: "alex",
    src: "https://picsum.photos/seed/contact17-1/64/64",
    name: "Alex Morgan",
  },
  {
    key: "maya",
    src: "https://picsum.photos/seed/contact17-2/64/64",
    name: "Maya Patel",
  },
  {
    key: "leo",
    src: "https://picsum.photos/seed/contact17-3/64/64",
    name: "Leo Fischer",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function LeadFormSocialProof() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-surface w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <span className="text-muted text-xs font-semibold tracking-wider uppercase">
          {co.contact17Eyebrow}
        </span>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.contact17Title}
            </Typography>
            <div className="flex flex-col gap-4">
              {CHECK_KEYS.map((checkKey) => (
                <div key={checkKey} className="flex items-start gap-3">
                  <span className="bg-brand/10 text-brand flex size-8 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={16} aria-hidden="true" />
                  </span>
                  <p className="text-fg text-base leading-relaxed">
                    {co[checkKey]}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {PROOF_AVATARS.map((proof) => (
                  <Avatar
                    key={proof.key}
                    src={proof.src}
                    alt={proof.name}
                    fallback={proof.name.split(" ")[0][0]}
                    size="sm"
                    className="border-border ring-surface ring-2"
                  />
                ))}
              </div>
              <span className="text-muted text-sm">
                {co.contact17Credibility}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="border-border/60 bg-bg text-muted flex h-12 items-center justify-center rounded-xl border text-sm font-semibold"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="border-border bg-bg flex h-fit flex-col gap-4 rounded-3xl border p-6 shadow-xs sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact17-first-name" required>
                  {co.contact17FormFirstNameLabel}
                </Label>
                <Input
                  id="contact17-first-name"
                  name="firstName"
                  type="text"
                  required
                  placeholder={co.contact17FormFirstNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact17-last-name" required>
                  {co.contact17FormLastNameLabel}
                </Label>
                <Input
                  id="contact17-last-name"
                  name="lastName"
                  type="text"
                  required
                  placeholder={co.contact17FormLastNamePlaceholder}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact17-email" required>
                {co.contact17FormEmailLabel}
              </Label>
              <Input
                id="contact17-email"
                name="email"
                type="email"
                required
                placeholder={co.contact17FormEmailPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact17-budget" required>
                {co.contact17FormBudgetLabel}
              </Label>
              <NativeSelect id="contact17-budget" name="budget" defaultValue="">
                <option value="" disabled>
                  {co.contact17FormBudgetPlaceholder}
                </option>
                {BUDGET_OPTION_KEYS.map((option) => (
                  <option key={option} value={option}>
                    {co[option]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact17-message" required>
                {co.contact17FormMessageLabel}
              </Label>
              <Textarea
                id="contact17-message"
                name="message"
                required
                placeholder={co.contact17FormMessagePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact17-referrer">
                {co.contact17FormReferrerLabel}
              </Label>
              <NativeSelect
                id="contact17-referrer"
                name="referrer"
                defaultValue=""
              >
                <option value="" disabled>
                  {co.contact17FormReferrerPlaceholder}
                </option>
                {REFERRER_OPTION_KEYS.map((option) => (
                  <option key={option} value={option}>
                    {co[option]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {submitted ? (
              <p className="bg-brand/10 text-brand rounded-full px-5 py-2.5 text-sm font-medium">
                {co.contact17SubmitSuccess}
              </p>
            ) : (
              <button
                type="submit"
                className="bg-brand text-brand-fg hover:bg-brand/90 mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
              >
                <IconSend size={15} aria-hidden="true" />
                {co.contact17Submit}
              </button>
            )}
            <p className="text-muted text-xs leading-relaxed">
              {co.contact17FormMicrocopy}
            </p>
          </form>
        </div>

        <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <span className="text-muted text-sm">
            {co.contact17FooterQuestion}
          </span>
          <div className="flex items-center gap-6">
            <a
              href={LINK_URL}
              className="text-fg inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              <IconHelpCircle
                size={15}
                className="text-muted"
                aria-hidden="true"
              />
              {co.contact17FooterFaq}
            </a>
            <a
              href={LINK_URL}
              className="text-fg inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              <IconFileText
                size={15}
                className="text-muted"
                aria-hidden="true"
              />
              {co.contact17FooterResources}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
