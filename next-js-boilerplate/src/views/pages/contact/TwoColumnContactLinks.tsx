"use client";

import {
  IconArrowUpRight,
  IconCalendar,
  IconFileText,
  IconLifebuoy,
  IconSpeakerphone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

interface ContactLink {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: Icon;
}

const CONTACT_LINKS: ContactLink[] = [
  {
    id: "booking",
    titleKey: "contact2Link1Title",
    descriptionKey: "contact2Link1Description",
    icon: IconCalendar,
  },
  {
    id: "support",
    titleKey: "contact2Link2Title",
    descriptionKey: "contact2Link2Description",
    icon: IconLifebuoy,
  },
  {
    id: "quote",
    titleKey: "contact2Link3Title",
    descriptionKey: "contact2Link3Description",
    icon: IconFileText,
  },
  {
    id: "press",
    titleKey: "contact2Link4Title",
    descriptionKey: "contact2Link4Description",
    icon: IconSpeakerphone,
  },
];

export function TwoColumnContactLinks() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
              {co.contact2Title}
            </h2>
            <p className="text-muted leading-relaxed lg:max-w-md">
              {co.contact2Description}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {CONTACT_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={LINK_URL}
                  className="border-border hover:bg-surface-hover group flex items-start justify-between gap-6 rounded-3xl border p-6 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="bg-fg text-bg flex size-12 shrink-0 items-center justify-center rounded-2xl">
                      <Icon size={20} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-medium">
                        {co[link.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {co[link.descriptionKey]}
                      </p>
                    </div>
                  </div>
                  <IconArrowUpRight
                    size={20}
                    className="text-muted group-hover:text-fg mt-1 shrink-0 transition-colors"
                  />
                </a>
              );
            })}
            <p className="text-muted mt-2 text-sm">
              {co.contact2EmailPrompt}{" "}
              <a
                href="mailto:hello@acme.com"
                className="text-brand font-medium underline underline-offset-4"
              >
                hello@acme.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
