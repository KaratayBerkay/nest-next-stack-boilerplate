"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconBolt,
  IconBrandFramer,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandSpotify,
  IconBrandStripe,
  IconBrandVercel,
  IconChartBar,
  IconClock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { DateTimeInput, Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BookADemo1Benefit,
  BookADemoLogo,
  PagesWithBookADemoMessages,
} from "@/types/pages/book-a-demo/BookADemoMessages-types";

const BENEFITS: BookADemo1Benefit[] = [
  { titleKey: "bookADemo1Benefit1", icon: IconBolt },
  { titleKey: "bookADemo1Benefit2", icon: IconChartBar },
  { titleKey: "bookADemo1Benefit3", icon: IconShieldCheck },
  { titleKey: "bookADemo1Benefit4", icon: IconClock },
];

const LOGOS: BookADemoLogo[] = [
  { icon: IconBrandVercel },
  { icon: IconBrandFramer },
  { icon: IconBrandNotion },
  { icon: IconBrandSlack },
  { icon: IconBrandStripe },
  { icon: IconBrandSpotify },
];

const COMPANY_SIZE_OPTIONS = [
  "bookADemo1FormCompanySizeOption1",
  "bookADemo1FormCompanySizeOption2",
  "bookADemo1FormCompanySizeOption3",
  "bookADemo1FormCompanySizeOption4",
];

function handleFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleSelectChange(
  event: ChangeEvent<HTMLSelectElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleDateTimeChange(
  date: Date | undefined,
  setValue: Dispatch<SetStateAction<Date | undefined>>,
) {
  setValue(date);
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setName: Dispatch<SetStateAction<string>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setCompanySize: Dispatch<SetStateAction<string>>,
  setDateTime: Dispatch<SetStateAction<Date | undefined>>,
) {
  event.preventDefault();
  setName("");
  setEmail("");
  setCompanySize("");
  setDateTime(undefined);
}

export function WithFormBenefitsLogos() {
  const t = useMessages("pages") as unknown as PagesWithBookADemoMessages;
  const bp = t.bookADemo;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {bp.bookADemo1Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {bp.bookADemo1Description}
              </Typography>
            </div>
            <ul className="flex flex-col gap-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit.titleKey} className="flex items-center gap-3">
                  <span className="bg-surface flex size-9 shrink-0 items-center justify-center rounded-full">
                    <benefit.icon size={16} className="text-brand" />
                  </span>
                  <span className="font-medium">{bp[benefit.titleKey]}</span>
                </li>
              ))}
            </ul>
            <div className="border-border flex flex-col gap-4 border-t pt-8">
              <Typography variant="caption">
                {bp.bookADemo1LogosLabel}
              </Typography>
              <div className="text-muted flex flex-wrap items-center gap-x-8 gap-y-4">
                {LOGOS.map((logo, index) => (
                  <span key={index} aria-hidden="true">
                    <logo.icon size={20} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) =>
              handleSubmit(
                event,
                setName,
                setEmail,
                setCompanySize,
                setDateTime,
              )
            }
            className="border-border bg-surface flex h-fit flex-col gap-4 rounded-2xl border p-6 lg:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo1-name"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo1FormNameLabel}
                </label>
                <Input
                  id="book-a-demo1-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => handleFieldChange(event, setName)}
                  placeholder={bp.bookADemo1FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo1-email"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo1FormEmailLabel}
                </label>
                <Input
                  id="book-a-demo1-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => handleFieldChange(event, setEmail)}
                  placeholder={bp.bookADemo1FormEmailPlaceholder}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo1-company-size"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo1FormCompanySizeLabel}
                </label>
                <NativeSelect
                  id="book-a-demo1-company-size"
                  required
                  value={companySize}
                  onChange={(event) =>
                    handleSelectChange(event, setCompanySize)
                  }
                >
                  <option value="" disabled>
                    {bp.bookADemo1FormCompanySizePlaceholder}
                  </option>
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {bp[option]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  {bp.bookADemo1FormDateTimeLabel}
                </label>
                <DateTimeInput
                  value={dateTime}
                  onChange={(date) => handleDateTimeChange(date, setDateTime)}
                  placeholder={bp.bookADemo1FormDateTimePlaceholder}
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              {bp.bookADemo1FormSubmit}
            </Button>
            <Typography variant="caption" className="text-center">
              {bp.bookADemo1FormNote}
            </Typography>
          </form>
        </div>
      </div>
    </section>
  );
}
