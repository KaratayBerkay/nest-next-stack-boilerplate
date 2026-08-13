"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const SUBJECT_OPTIONS = [
  "contact33SubjectOptionGeneral",
  "contact33SubjectOptionProject",
  "contact33SubjectOptionCollaboration",
  "contact33SubjectOptionPress",
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function TwoColumnRoundedPhoto() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [subject, setSubject] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter"
            >
              {co.contact33Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.contact33Description}
            </Typography>
          </div>
          {submitted ? (
            <div className="border-border bg-success/10 text-success flex flex-col gap-2 rounded-2xl border p-5">
              <Typography variant="h4">{co.contact33SuccessTitle}</Typography>
              <Typography variant="bodySmall">
                {co.contact33SuccessDescription}
              </Typography>
            </div>
          ) : (
            <form
              onSubmit={(event) => handleSubmit(event, setSubmitted)}
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact33-name">
                    {co.contact33FormNameLabel}
                  </Label>
                  <Input
                    id="contact33-name"
                    type="text"
                    required
                    placeholder={co.contact33FormNamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact33-email">
                    {co.contact33FormEmailLabel}
                  </Label>
                  <Input
                    id="contact33-email"
                    type="email"
                    required
                    placeholder={co.contact33FormEmailPlaceholder}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact33-subject">
                  {co.contact33FormSubjectLabel}
                </Label>
                <Select
                  value={subject}
                  onValueChange={setSubject}
                  name="contact33-subject"
                >
                  <SelectTrigger id="contact33-subject" className="w-full">
                    {subject ? co[subject] : co.contact33FormSubjectPlaceholder}
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {co[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact33-message">
                  {co.contact33FormMessageLabel}
                </Label>
                <Textarea
                  id="contact33-message"
                  required
                  placeholder={co.contact33FormMessagePlaceholder}
                  rows={5}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-full sm:w-auto"
              >
                {co.contact33SubmitLabel}
              </Button>
            </form>
          )}
        </div>
        <div className="relative hidden min-h-[640px] lg:block">
          <Image
            src="https://picsum.photos/seed/contact33-team/800/1000"
            alt={co.contact33ImageAlt}
            fill
            sizes="(max-width: 1024px) 0vw, 50vw"
            className="rounded-3xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
