"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface LocationItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const LOCATIONS: LocationItem[] = [
  {
    id: "istanbul",
    name: "Istanbul",
    address: "Ara Güler Caddesi No. 27, Beşiktaş",
    phone: "+90 212 555 0147",
    email: "istanbul@atelier.com",
  },
  {
    id: "berlin",
    name: "Berlin",
    address: "Bergmannstraße 12, Kreuzberg",
    phone: "+49 30 555 0148",
    email: "berlin@atelier.com",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    address: "Shibuya 2-21-1, Shibuya-ku",
    phone: "+81 3 5555 0149",
    email: "tokyo@atelier.com",
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    address: "100 Larkin Street, SoMa",
    phone: "+1 415 555 0150",
    email: "sf@atelier.com",
  },
];

function selectLocation(
  setActiveId: Dispatch<SetStateAction<string>>,
  id: string,
) {
  setActiveId(id);
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function MultiLocationMap() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [activeId, setActiveId] = useState(LOCATIONS[0].id);
  const [submitted, setSubmitted] = useState(false);
  const active =
    LOCATIONS.find((location) => location.id === activeId) ?? LOCATIONS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 flex max-w-2xl flex-col gap-4 lg:mb-16">
          <p className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co.contact22Eyebrow}
          </p>
          <h2 className="text-4xl font-medium tracking-tighter md:text-5xl">
            {co.contact22Heading}
          </h2>
          <p className="text-muted">{co.contact22Description}</p>
        </div>

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3">
            {LOCATIONS.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => selectLocation(setActiveId, location.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors",
                  activeId === location.id
                    ? "border-border bg-surface-hover"
                    : "hover:bg-surface-hover border-transparent",
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    activeId === location.id && "text-brand",
                  )}
                >
                  {location.name}
                </span>
                <span className="text-muted text-sm">{location.address}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-border bg-surface-hover/50 relative h-64 overflow-hidden rounded-3xl border lg:h-80">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 place-items-center gap-8 p-10">
                {LOCATIONS.map((location) => (
                  <IconMapPin
                    key={location.id}
                    aria-hidden="true"
                    className={cn(
                      "size-6",
                      activeId === location.id ? "text-brand" : "text-muted/60",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
              <span className="font-medium">{active.name}</span>
              <div className="flex items-start gap-3">
                <IconMapPin className="text-muted mt-0.5 size-4 shrink-0" />
                <span className="text-muted text-sm">{active.address}</span>
              </div>
              <div className="flex items-start gap-3">
                <IconPhone className="text-muted mt-0.5 size-4 shrink-0" />
                <a
                  href={`tel:${active.phone}`}
                  className="text-muted text-sm underline-offset-4 hover:underline"
                >
                  {active.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <IconMail className="text-muted mt-0.5 size-4 shrink-0" />
                <a
                  href={`mailto:${active.email}`}
                  className="text-muted text-sm underline-offset-4 hover:underline"
                >
                  {active.email}
                </a>
              </div>
            </div>

            <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
              {submitted ? (
                <div
                  key="contact22-success"
                  className="flex flex-col gap-2 py-4"
                >
                  <span className="font-medium">
                    {co.contact22SuccessTitle}
                  </span>
                  <p className="text-muted text-sm">
                    {co.contact22SuccessDescription}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => handleSubmit(event, setSubmitted)}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact22-name"
                        className="text-sm font-medium"
                      >
                        {co.contact22FormNameLabel}
                      </label>
                      <Input
                        id="contact22-name"
                        name="name"
                        type="text"
                        required
                        placeholder={co.contact22FormNamePlaceholder}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact22-email"
                        className="text-sm font-medium"
                      >
                        {co.contact22FormEmailLabel}
                      </label>
                      <Input
                        id="contact22-email"
                        name="email"
                        type="email"
                        required
                        placeholder={co.contact22FormEmailPlaceholder}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="contact22-message"
                      className="text-sm font-medium"
                    >
                      {co.contact22FormMessageLabel}
                    </label>
                    <Textarea
                      id="contact22-message"
                      name="message"
                      required
                      rows={4}
                      placeholder={co.contact22FormMessagePlaceholder}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="!rounded-full"
                  >
                    {co.contact22FormSubmit}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
