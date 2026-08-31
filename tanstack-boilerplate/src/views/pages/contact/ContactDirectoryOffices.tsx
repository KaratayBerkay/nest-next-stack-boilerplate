"use client";

import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface Office {
  id: string;
  city: string;
  address: string;
  phone: string;
  tel: string;
  email: string;
}

const OFFICES: Office[] = [
  {
    id: "new-york",
    city: "New York",
    address: "350 Fifth Avenue, New York, NY 10118",
    phone: "+1 (212) 555-0134",
    tel: "+12125550134",
    email: "newyork@acme.com",
  },
  {
    id: "london",
    city: "London",
    address: "221B Baker Street, London NW1 6XE",
    phone: "+44 20 7946 0958",
    tel: "+442079460958",
    email: "london@acme.com",
  },
  {
    id: "san-francisco",
    city: "San Francisco",
    address: "1 Market Street, San Francisco, CA 94105",
    phone: "+1 (415) 555-0178",
    tel: "+14155550178",
    email: "sanfrancisco@acme.com",
  },
  {
    id: "singapore",
    city: "Singapore",
    address: "10 Anson Road, Singapore 079903",
    phone: "+65 6555 0119",
    tel: "+6565550119",
    email: "singapore@acme.com",
  },
];

export function ContactDirectoryOffices() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-12 flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
            {co.contact3Title}
          </h2>
          <p className="text-muted leading-relaxed">{co.contact3Description}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {OFFICES.map((office) => (
            <article
              key={office.id}
              className="border-border hover:bg-surface-hover flex flex-col gap-6 rounded-3xl border p-6 transition-colors lg:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-2xl">
                  <IconMapPin size={20} />
                </span>
                <h3 className="text-xl font-medium">{office.city}</h3>
              </div>
              <p className="text-muted leading-relaxed">{office.address}</p>
              <div className="border-border border-t border-dashed" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <IconPhone size={16} className="text-muted shrink-0" />
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-muted text-sm">
                      {co.contact3CallLabel}
                    </span>
                    <a
                      href={`tel:${office.tel}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {office.phone}
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <IconMail size={16} className="text-muted shrink-0" />
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-muted text-sm">
                      {co.contact3EmailLabel}
                    </span>
                    <a
                      href={`mailto:${office.email}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {office.email}
                    </a>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
