"use client";

import {
  IconArrowUpRight,
  IconBriefcase,
  IconHeartHandshake,
  IconLifebuoy,
  IconMail,
  IconNews,
  IconPhone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

interface ContactMethod {
  id: string;
  titleKey: string;
  descriptionKey: string;
  value: string;
  icon: Icon;
}

const CONTACT_METHODS: ContactMethod[] = [
  {
    id: "sales",
    titleKey: "contact7Card1Title",
    descriptionKey: "contact7Card1Description",
    value: "+1 (555) 012-3456",
    icon: IconPhone,
  },
  {
    id: "support",
    titleKey: "contact7Card2Title",
    descriptionKey: "contact7Card2Description",
    value: "support@acme.com",
    icon: IconLifebuoy,
  },
  {
    id: "email",
    titleKey: "contact7Card3Title",
    descriptionKey: "contact7Card3Description",
    value: "hello@acme.com",
    icon: IconMail,
  },
  {
    id: "press",
    titleKey: "contact7Card4Title",
    descriptionKey: "contact7Card4Description",
    value: "press@acme.com",
    icon: IconNews,
  },
  {
    id: "partners",
    titleKey: "contact7Card5Title",
    descriptionKey: "contact7Card5Description",
    value: "partners@acme.com",
    icon: IconHeartHandshake,
  },
  {
    id: "careers",
    titleKey: "contact7Card6Title",
    descriptionKey: "contact7Card6Description",
    value: "jobs@acme.com",
    icon: IconBriefcase,
  },
];

export function ContactMethodGrid() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
            {co.contact7Title}
          </h2>
          <p className="text-muted max-w-lg leading-relaxed">
            {co.contact7Description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {CONTACT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <a
                key={method.id}
                href={LINK_URL}
                className="border-border hover:bg-surface-hover group flex flex-col gap-6 rounded-3xl border p-6 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-2xl">
                    <Icon size={22} />
                  </span>
                  <IconArrowUpRight
                    size={20}
                    className="text-muted group-hover:text-fg transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">{co[method.titleKey]}</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {co[method.descriptionKey]}
                  </p>
                </div>
                <span className="text-brand text-sm font-medium">
                  {method.value}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
