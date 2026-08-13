"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { IconCheck, IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const STEP_COUNT = 3 as const;

const STEPS = [
  "contact28Step1Title",
  "contact28Step2Title",
  "contact28Step3Title",
] as const;

const TOPIC_OPTIONS = [
  "contact28TopicOption1",
  "contact28TopicOption2",
  "contact28TopicOption3",
  "contact28TopicOption4",
] as const;

const BUDGET_OPTIONS = [
  "contact28BudgetOption1",
  "contact28BudgetOption2",
  "contact28BudgetOption3",
  "contact28BudgetOption4",
] as const;

function goToStep(setStep: Dispatch<SetStateAction<number>>, next: number) {
  setStep(next);
}

function canGoNext(
  step: number,
  topic: string,
  name: string,
  email: string,
  message: string,
): boolean {
  if (step === 0) return topic.trim() !== "";
  if (step === 1) return name.trim() !== "" && email.trim() !== "";
  return message.trim() !== "";
}

function handleSelectChange(
  event: ChangeEvent<HTMLSelectElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleMessageChange(
  event: ChangeEvent<HTMLTextAreaElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

function handleReset(
  setStep: Dispatch<SetStateAction<number>>,
  setTopic: Dispatch<SetStateAction<string>>,
  setBudget: Dispatch<SetStateAction<string>>,
  setName: Dispatch<SetStateAction<string>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setPhone: Dispatch<SetStateAction<string>>,
  setMessage: Dispatch<SetStateAction<string>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  setStep(0);
  setTopic("");
  setBudget("");
  setName("");
  setEmail("");
  setPhone("");
  setMessage("");
  setSubmitted(false);
}

export function MultiStepContactForm() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-surface-hover/40 w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.contact28Title}
          </h2>
          <ol className="flex flex-col gap-6">
            {STEPS.map((label, index) => {
              const isActive = step === index;
              const isComplete = step > index;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                      isActive && "bg-brand text-brand-fg",
                      isComplete && "bg-success text-success-fg",
                      !isActive && !isComplete && "bg-surface text-muted",
                    )}
                  >
                    {isComplete ? <IconCheck className="size-4" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive && "text-brand",
                      isComplete && "text-fg",
                      !isActive && !isComplete && "text-muted",
                    )}
                  >
                    {co[label]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {submitted ? (
          <div
            key="contact28-success"
            className="border-border bg-bg flex flex-1 flex-col items-center gap-4 rounded-3xl border p-10 text-center shadow-lg"
          >
            <span className="bg-success/10 flex size-16 items-center justify-center rounded-full">
              <IconCircleCheck className="text-success size-8" />
            </span>
            <h3 className="text-2xl font-medium tracking-tight">
              {co.contact28SuccessTitle}
            </h3>
            <p className="text-muted max-w-md">
              {co.contact28SuccessDescription}
            </p>
            <Button
              type="button"
              variant="outline"
              className="!rounded-full"
              onClick={() =>
                handleReset(
                  setStep,
                  setTopic,
                  setBudget,
                  setName,
                  setEmail,
                  setPhone,
                  setMessage,
                  setSubmitted,
                )
              }
            >
              {co.contact28Reset}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="border-border bg-bg flex flex-1 flex-col gap-8 rounded-3xl border p-6 shadow-lg lg:p-10"
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact28-topic"
                    className="text-sm font-medium"
                  >
                    {co.contact28TopicLabel}
                  </label>
                  <NativeSelect
                    id="contact28-topic"
                    required
                    value={topic}
                    onChange={(event) => handleSelectChange(event, setTopic)}
                  >
                    <option value="" disabled>
                      {co.contact28TopicPlaceholder}
                    </option>
                    {TOPIC_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {co[option]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact28-budget"
                    className="text-sm font-medium"
                  >
                    {co.contact28BudgetLabel}
                  </label>
                  <NativeSelect
                    id="contact28-budget"
                    value={budget}
                    onChange={(event) => handleSelectChange(event, setBudget)}
                  >
                    <option value="" disabled>
                      {co.contact28BudgetPlaceholder}
                    </option>
                    {BUDGET_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {co[option]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact28-name"
                    className="text-sm font-medium"
                  >
                    {co.contact28NameLabel}
                  </label>
                  <Input
                    id="contact28-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => handleFieldChange(event, setName)}
                    placeholder={co.contact28NamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact28-email"
                    className="text-sm font-medium"
                  >
                    {co.contact28EmailLabel}
                  </label>
                  <Input
                    id="contact28-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => handleFieldChange(event, setEmail)}
                    placeholder={co.contact28EmailPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact28-phone"
                    className="text-sm font-medium"
                  >
                    {co.contact28PhoneLabel}
                  </label>
                  <Input
                    id="contact28-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => handleFieldChange(event, setPhone)}
                    placeholder={co.contact28PhonePlaceholder}
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact28-message"
                  className="text-sm font-medium"
                >
                  {co.contact28MessageLabel}
                </label>
                <Textarea
                  id="contact28-message"
                  required
                  rows={8}
                  value={message}
                  onChange={(event) => handleMessageChange(event, setMessage)}
                  placeholder={co.contact28MessagePlaceholder}
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="!rounded-full"
                  onClick={() => goToStep(setStep, step - 1)}
                >
                  {co.contact28Back}
                </Button>
              ) : (
                <span />
              )}
              {step < STEP_COUNT - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  className="!rounded-full"
                  disabled={!canGoNext(step, topic, name, email, message)}
                  onClick={() => goToStep(setStep, step + 1)}
                >
                  {co.contact28Continue}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  className="!rounded-full"
                  disabled={!canGoNext(step, topic, name, email, message)}
                >
                  {co.contact28Submit}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
