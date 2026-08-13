"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function SplitCardContact() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="border-border bg-surface grid overflow-hidden rounded-3xl border shadow-sm lg:grid-cols-2">
          <div className="relative hidden min-h-full lg:block">
            <Image
              src="https://picsum.photos/seed/contact31-split/1200/800"
              alt={co.contact31ImageAlt}
              fill
              sizes="(max-width: 1024px) 0vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-6 p-6 md:p-10 lg:p-12">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter"
              >
                {co.contact31Title}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {co.contact31Description}
              </Typography>
            </div>
            {submitted ? (
              <div className="border-border bg-surface-hover flex flex-col items-start gap-3 rounded-2xl border p-6">
                <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
                  <IconCheck size={22} />
                </span>
                <Typography variant="h4">{co.contact31SuccessTitle}</Typography>
                <Typography variant="bodySmall" className="text-muted">
                  {co.contact31SuccessDescription}
                </Typography>
              </div>
            ) : (
              <form
                onSubmit={(event) => handleSubmit(event, setSubmitted)}
                className="flex flex-col gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact31-name">
                      {co.contact31FormNameLabel}
                    </Label>
                    <Input
                      id="contact31-name"
                      type="text"
                      required
                      placeholder={co.contact31FormNamePlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact31-email">
                      {co.contact31FormEmailLabel}
                    </Label>
                    <Input
                      id="contact31-email"
                      type="email"
                      required
                      placeholder={co.contact31FormEmailPlaceholder}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact31-company" className="text-muted">
                    {co.contact31FormCompanyLabel}
                  </Label>
                  <Input
                    id="contact31-company"
                    type="text"
                    placeholder={co.contact31FormCompanyPlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact31-message">
                    {co.contact31FormMessageLabel}
                  </Label>
                  <Textarea
                    id="contact31-message"
                    required
                    placeholder={co.contact31FormMessagePlaceholder}
                    rows={5}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full rounded-full sm:w-fit"
                >
                  {co.contact31SubmitLabel}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
