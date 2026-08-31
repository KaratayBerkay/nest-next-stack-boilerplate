"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { IconProps } from "@tabler/icons-react";
import {
  IconChevronDown,
  IconChevronRight,
  IconMail,
  IconMessageCircle,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  HelpCenterMessages,
  PagesWithHelpCenterMessages,
} from "@/types/pages/help-center/HelpCenterMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface FaqItem {
  id: string;
  qKey: string;
  aKey: string;
}

const FAQ_ITEMS: FaqItem[] = [
  { id: "password", qKey: "helpCenter2Q1", aKey: "helpCenter2A1" },
  { id: "plan", qKey: "helpCenter2Q2", aKey: "helpCenter2A2" },
  { id: "invite", qKey: "helpCenter2Q3", aKey: "helpCenter2A3" },
  { id: "api-key", qKey: "helpCenter2Q4", aKey: "helpCenter2A4" },
  { id: "backup", qKey: "helpCenter2Q5", aKey: "helpCenter2A5" },
  { id: "cancel", qKey: "helpCenter2Q6", aKey: "helpCenter2A6" },
];

interface ContactOption {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descriptionKey: string;
}

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: "chat",
    icon: IconMessageCircle,
    titleKey: "helpCenter2Option1Title",
    descriptionKey: "helpCenter2Option1Description",
  },
  {
    id: "email",
    icon: IconMail,
    titleKey: "helpCenter2Option2Title",
    descriptionKey: "helpCenter2Option2Description",
  },
  {
    id: "community",
    icon: IconUsers,
    titleKey: "helpCenter2Option3Title",
    descriptionKey: "helpCenter2Option3Description",
  },
];

const SUPPORT_AGENTS = [
  { id: "agent-1", seed: "help-center2-agent-1", initials: "AK" },
  { id: "agent-2", seed: "help-center2-agent-2", initials: "SR" },
  { id: "agent-3", seed: "help-center2-agent-3", initials: "LT" },
];

function filterFaqItems(
  items: readonly FaqItem[],
  query: string,
  h: HelpCenterMessages,
): FaqItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((item) => {
    const question = h[item.qKey].toLowerCase();
    const answer = h[item.aKey].toLowerCase();
    return question.includes(q) || answer.includes(q);
  });
}

export function SearchableFaqSupportHelpCenter() {
  const t = useMessages("pages") as unknown as PagesWithHelpCenterMessages;
  const h = t.helpCenter;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterFaqItems(FAQ_ITEMS, query, h), [query, h]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="flex flex-col gap-3">
              <Badge variant="soft" pill className="w-fit">
                {h.helpCenter2Badge}
              </Badge>
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {h.helpCenter2Title}
              </h2>
              <p className="text-muted leading-relaxed">
                {h.helpCenter2Description}
              </p>
            </div>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={h.helpCenter2SearchPlaceholder}
              aria-label={h.helpCenter2SearchAria}
              leftIcon={<IconSearch size={16} />}
            />
            {filtered.length === 0 ? (
              <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
                <p className="text-muted text-sm">{h.helpCenter2NoResults}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setQuery("")}
                >
                  {h.helpCenter2ClearSearch}
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible>
                {filtered.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="group">
                      <span>{h[item.qKey]}</span>
                      <IconChevronDown
                        size={16}
                        className="shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
                      />
                    </AccordionTrigger>
                    <AccordionContent>{h[item.aKey]}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className="border-border bg-surface flex h-fit flex-col gap-6 rounded-3xl border p-6 lg:col-span-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-fg text-lg font-semibold">
                {h.helpCenter2ContactPanelTitle}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {h.helpCenter2ContactPanelDescription}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AvatarGroup max={3}>
                {SUPPORT_AGENTS.map((agent) => (
                  <Avatar
                    key={agent.id}
                    size="sm"
                    src={placeholderImage(agent.seed, "1x1")}
                    fallback={agent.initials}
                  />
                ))}
              </AvatarGroup>
              <span className="text-muted text-xs">
                {h.helpCenter2ResponseTime}
              </span>
            </div>
            <div className="border-border divide-border overflow-hidden rounded-2xl border divide-y">
              {CONTACT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.id}
                    href="#"
                    className="hover:bg-surface-hover flex items-center gap-4 p-4 transition-colors"
                  >
                    <span className="border-border bg-surface-hover/50 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl border">
                      <Icon size={18} />
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-fg text-sm font-semibold">
                        {h[option.titleKey]}
                      </span>
                      <span className="text-muted text-xs leading-relaxed">
                        {h[option.descriptionKey]}
                      </span>
                    </span>
                    <IconChevronRight
                      size={16}
                      className="text-muted shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
