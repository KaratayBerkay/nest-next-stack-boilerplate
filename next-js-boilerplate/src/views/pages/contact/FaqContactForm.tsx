"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import {
  IconCheck,
  IconChevronDown,
  IconHelpCircle,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface FaqItem {
  value: string;
  questionKey: string;
  answerKey: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    value: "contact25-faq-1",
    questionKey: "contact25Faq1Question",
    answerKey: "contact25Faq1Answer",
  },
  {
    value: "contact25-faq-2",
    questionKey: "contact25Faq2Question",
    answerKey: "contact25Faq2Answer",
  },
  {
    value: "contact25-faq-3",
    questionKey: "contact25Faq3Question",
    answerKey: "contact25Faq3Answer",
  },
  {
    value: "contact25-faq-4",
    questionKey: "contact25Faq4Question",
    answerKey: "contact25Faq4Answer",
  },
  {
    value: "contact25-faq-5",
    questionKey: "contact25Faq5Question",
    answerKey: "contact25Faq5Answer",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function FaqContactForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
              <IconHelpCircle className="size-5" />
            </span>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
              {co.contact25Heading}
            </h2>
          </div>
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-border rounded-2xl border"
              >
                <AccordionTrigger className="group gap-4 px-5">
                  <span className="flex-1 text-left">
                    {co[item.questionKey]}
                  </span>
                  <IconChevronDown className="text-muted size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="px-5">
                  {co[item.answerKey]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
              <IconMessageCircle className="size-5" />
            </span>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
              {co.contact25FormHeading}
            </h2>
          </div>
          <div className="border-border bg-surface-hover/50 flex flex-col gap-4 rounded-3xl border p-6 lg:p-8">
            {submitted ? (
              <div
                key="contact25-success"
                className="flex flex-col items-start gap-4 py-6"
              >
                <span className="bg-success/10 flex size-12 items-center justify-center rounded-full">
                  <IconCheck className="text-success size-5" />
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-xl font-medium">
                    {co.contact25SuccessTitle}
                  </span>
                  <p className="text-muted text-sm">
                    {co.contact25SuccessDescription}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(event) => handleSubmit(event, setSubmitted)}
                className="flex flex-col gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact25-name"
                      className="text-sm font-medium"
                    >
                      {co.contact25FormNameLabel}
                    </label>
                    <Input
                      id="contact25-name"
                      name="name"
                      type="text"
                      required
                      placeholder={co.contact25FormNamePlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact25-email"
                      className="text-sm font-medium"
                    >
                      {co.contact25FormEmailLabel}
                    </label>
                    <Input
                      id="contact25-email"
                      name="email"
                      type="email"
                      required
                      placeholder={co.contact25FormEmailPlaceholder}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact25-message"
                    className="text-sm font-medium"
                  >
                    {co.contact25FormMessageLabel}
                  </label>
                  <Textarea
                    id="contact25-message"
                    name="message"
                    required
                    rows={5}
                    placeholder={co.contact25FormMessagePlaceholder}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="!rounded-full"
                >
                  {co.contact25Submit}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
