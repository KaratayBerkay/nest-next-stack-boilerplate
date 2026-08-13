"use client";

import Image from "next/image";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface Office {
  id: string;
  city: string;
  regionKey: string;
  address: string;
  phone: string;
  email: string;
  seed: string;
}

const LINK_URL = "#" as const;

const OFFICES: Office[] = [
  {
    id: "london",
    city: "London",
    regionKey: "contact24RegionEurope",
    address: "123 Regent Street, London W1B 3TH",
    phone: "+44 20 5555 0147",
    email: "london@atelier.com",
    seed: "contact24-london",
  },
  {
    id: "singapore",
    city: "Singapore",
    regionKey: "contact24RegionAsiaPacific",
    address: "1 Raffles Place, Tower 2, Singapore 048616",
    phone: "+65 6555 0148",
    email: "singapore@atelier.com",
    seed: "contact24-singapore",
  },
  {
    id: "san-francisco",
    city: "San Francisco",
    regionKey: "contact24RegionNorthAmerica",
    address: "100 Larkin Street, San Francisco, CA 94103",
    phone: "+1 415 555 0149",
    email: "sf@atelier.com",
    seed: "contact24-san-francisco",
  },
  {
    id: "dubai",
    city: "Dubai",
    regionKey: "contact24RegionMiddleEast",
    address: "Level 14, DIFC Gate Village, Dubai",
    phone: "+971 4 555 0150",
    email: "dubai@atelier.com",
    seed: "contact24-dubai",
  },
];

export function GlobalOfficesGrid() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center lg:mb-16">
          <p className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co.contact24Eyebrow}
          </p>
          <h2 className="text-4xl font-medium tracking-tighter md:text-5xl">
            {co.contact24Title}
          </h2>
          <p className="text-muted">{co.contact24Description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {OFFICES.map((office) => (
            <div
              key={office.id}
              className="border-border bg-surface group flex flex-col overflow-hidden rounded-3xl border"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/${office.seed}/1200/800`}
                  alt={co.contact24ImageAlt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="from-fg/50 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
                  <span className="text-bg text-xs font-semibold tracking-widest uppercase">
                    {co[office.regionKey]}
                  </span>
                  <span className="text-bg text-3xl font-medium tracking-tight">
                    {office.city}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-start gap-3">
                  <IconMapPin className="text-muted mt-0.5 size-4 shrink-0" />
                  <span className="text-muted text-sm">{office.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconPhone className="text-muted mt-0.5 size-4 shrink-0" />
                  <span className="text-muted text-sm">{office.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconMail className="text-muted mt-0.5 size-4 shrink-0" />
                  <span className="text-muted text-sm">{office.email}</span>
                </div>
              </div>
              <div className="border-border mt-auto border-t p-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full !rounded-full"
                >
                  <a href={LINK_URL}>{co.contact24OpenMap}</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
