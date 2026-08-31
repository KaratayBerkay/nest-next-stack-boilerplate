"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCircleCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface Channel {
  id: string;
  titleKey: string;
  value: string;
  icon: Icon;
}

interface HoursRow {
  id: string;
  days: string;
  hours?: string;
  hoursKey?: string;
}

const CHANNELS: Channel[] = [
  {
    id: "email",
    titleKey: "contact6Channel1Title",
    value: "hello@acme.com",
    icon: IconMail,
  },
  {
    id: "phone",
    titleKey: "contact6Channel2Title",
    value: "+1 (555) 012-3456",
    icon: IconPhone,
  },
  {
    id: "visit",
    titleKey: "contact6Channel3Title",
    value: "1 Market Street, San Francisco, CA 94105",
    icon: IconMapPin,
  },
];

const HOURS_ROWS: HoursRow[] = [
  { id: "weekdays", days: "Mon – Fri", hours: "09:00 – 18:00" },
  { id: "saturday", days: "Sat", hours: "10:00 – 16:00" },
  { id: "sunday", days: "Sun", hoursKey: "contact6HoursClosed" },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function ContactChannelsFormHours() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
                {co.contact6Title}
              </h2>
              <p className="text-muted leading-relaxed">
                {co.contact6Description}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.id}
                    className="border-border flex items-start gap-4 rounded-3xl border p-5"
                  >
                    <span className="bg-muted/15 text-fg flex size-10 shrink-0 items-center justify-center rounded-2xl">
                      <Icon size={20} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {co[channel.titleKey]}
                      </span>
                      <span className="text-muted text-sm break-words">
                        {channel.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-border flex h-fit flex-col gap-6 rounded-3xl border p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-medium">{co.contact6FormTitle}</h3>
              <Separator />
            </div>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <IconCircleCheck size={40} className="text-brand" />
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">{co.contact6FormSuccess}</h4>
                  <p className="text-muted text-sm leading-relaxed">
                    {co.contact6FormSuccessDescription}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(event) => handleSubmit(event, setSubmitted)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact6-first-name"
                      className="text-sm font-medium"
                    >
                      {co.contact6FormFirstNameLabel}
                    </label>
                    <Input
                      id="contact6-first-name"
                      type="text"
                      name="firstName"
                      required
                      placeholder={co.contact6FormFirstNamePlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact6-email"
                      className="text-sm font-medium"
                    >
                      {co.contact6FormEmailLabel}
                    </label>
                    <Input
                      id="contact6-email"
                      type="email"
                      name="email"
                      required
                      placeholder={co.contact6FormEmailPlaceholder}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact6-message"
                    className="text-sm font-medium"
                  >
                    {co.contact6FormMessageLabel}
                  </label>
                  <Textarea
                    id="contact6-message"
                    name="message"
                    required
                    placeholder={co.contact6FormMessagePlaceholder}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  {co.contact6FormSubmit}
                </Button>
              </form>
            )}
          </div>
          <div className="border-border flex h-fit flex-col gap-6 rounded-3xl border p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-medium">{co.contact6HoursTitle}</h3>
              <span className="bg-success/10 text-success flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                <IconClock size={14} />
                {co.contact6HoursStatus}
              </span>
            </div>
            <div className="flex flex-col">
              {HOURS_ROWS.map((row) => (
                <div
                  key={row.id}
                  className="border-border flex items-center justify-between border-b py-3 last:border-b-0"
                >
                  <span className="text-sm">{row.days}</span>
                  <span className="text-muted text-sm">
                    {row.hoursKey ? co[row.hoursKey] : row.hours}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-border flex flex-col gap-1 border-t border-dashed pt-4">
              <span className="text-sm font-medium">
                {co.contact6AfterHoursLabel}
              </span>
              <a
                href="mailto:support@acme.com"
                className="text-brand w-fit text-sm font-medium underline-offset-4 hover:underline"
              >
                support@acme.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
