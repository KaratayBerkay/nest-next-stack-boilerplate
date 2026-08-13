"use client";

import Image from "next/image";
import {
  IconGlobe,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const LINK_URL = "#" as const;

interface ContactCard {
  id: string;
  titleKey: string;
  hintKey: string;
  value: string;
  icon: Icon;
}

interface SocialLink {
  id: string;
  ariaKey: string;
  icon: Icon;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    id: "phone",
    titleKey: "contact8Card1Title",
    hintKey: "contact8Card1Hint",
    value: "+1 (555) 012-3456",
    icon: IconPhone,
  },
  {
    id: "email",
    titleKey: "contact8Card2Title",
    hintKey: "contact8Card2Hint",
    value: "hello@acme.com",
    icon: IconMail,
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { id: "x", ariaKey: "contact8SocialX", icon: IconX },
  { id: "send", ariaKey: "contact8SocialSend", icon: IconSend },
  { id: "globe", ariaKey: "contact8SocialGlobe", icon: IconGlobe },
  { id: "message", ariaKey: "contact8SocialMessage", icon: IconMessageCircle },
];

export function SplitMediaFramedCards() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-border relative aspect-[5/6] overflow-hidden rounded-3xl border">
            <Image
              src="https://picsum.photos/seed/contact8-office/1000/1200"
              alt={co.contact8ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
                {co.contact8Title}
              </h2>
              <p className="text-muted leading-relaxed lg:max-w-md">
                {co.contact8Description}
              </p>
            </div>
            <div className="flex w-full flex-col gap-4">
              {CONTACT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className="border-border flex items-center justify-between gap-4 rounded-3xl border p-5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="bg-muted/15 text-fg flex size-11 shrink-0 items-center justify-center rounded-2xl">
                        <Icon size={20} />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-medium">{co[card.titleKey]}</h3>
                        <span className="text-muted text-sm">
                          {co[card.hintKey]}
                        </span>
                      </div>
                    </div>
                    <span className="text-brand text-right text-sm font-medium">
                      {card.value}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-muted text-sm">
                {co.contact8SocialLabel}
              </span>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.id}
                      href={LINK_URL}
                      aria-label={co[social.ariaKey]}
                      className="border-border text-muted hover:bg-surface-hover hover:text-fg flex size-10 items-center justify-center rounded-full border transition-colors"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
