"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconLifebuoy,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithHelpMessages } from "@/types/pages/help/HelpMessages-types";

interface FaqEntry {
  id: string;
  questionKey: string;
  answerKey: string;
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "help3-faq-1",
    questionKey: "help3Faq1Question",
    answerKey: "help3Faq1Answer",
  },
  {
    id: "help3-faq-2",
    questionKey: "help3Faq2Question",
    answerKey: "help3Faq2Answer",
  },
  {
    id: "help3-faq-3",
    questionKey: "help3Faq3Question",
    answerKey: "help3Faq3Answer",
  },
  {
    id: "help3-faq-4",
    questionKey: "help3Faq4Question",
    answerKey: "help3Faq4Answer",
  },
];

const AGENT_AVATAR_SRC = placeholderImage("help3-agent", "1x1");

function toggleOpen(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((previous) => !previous);
}

function handleContactSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function FloatingFaqLauncherHelp() {
  const t = useMessages("pages") as unknown as PagesWithHelpMessages;
  const h = t.help;
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface/40 relative isolate h-[36rem] overflow-hidden rounded-2xl border">
          <div aria-hidden="true" className="flex flex-col gap-3 p-8">
            <div className="bg-surface-hover h-3 w-40 rounded-full" />
            <div className="bg-surface-hover h-3 w-64 rounded-full" />
            <div className="bg-surface-hover h-3 w-52 rounded-full" />
            <div className="bg-surface-hover mt-4 h-28 w-full max-w-sm rounded-xl" />
            <div className="bg-surface-hover h-3 w-36 rounded-full" />
          </div>

          {open && (
            <div className="border-border bg-bg absolute right-6 bottom-24 z-10 flex w-[22rem] max-w-[calc(100%-3rem)] flex-col overflow-hidden rounded-2xl border shadow-xl">
              <div className="border-border bg-surface flex items-center gap-3 border-b p-4">
                <Avatar
                  src={AGENT_AVATAR_SRC}
                  alt={h.help3AgentName}
                  fallback={h.help3AgentName}
                  status="online"
                  size="md"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="text-fg text-sm font-semibold">
                    {h.help3AgentName}
                  </span>
                  <span className="text-muted text-xs">
                    {h.help3AgentRole}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="faq">
                <div className="border-border border-b p-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="faq" className="flex-1">
                      {h.help3FaqTabLabel}
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex-1">
                      {h.help3ContactTabLabel}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="faq"
                  className="block max-h-72 overflow-y-auto p-3"
                >
                  <Accordion type="single" collapsible className="flex flex-col gap-2">
                    {FAQ_ENTRIES.map((entry) => (
                      <AccordionItem
                        key={entry.id}
                        value={entry.id}
                        className="border-border rounded-lg border"
                      >
                        <AccordionTrigger className="group gap-3 text-sm">
                          <span className="flex-1 text-left">
                            {h[entry.questionKey]}
                          </span>
                          <IconChevronDown
                            size={14}
                            className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          />
                        </AccordionTrigger>
                        <AccordionContent>{h[entry.answerKey]}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>

                <TabsContent
                  value="contact"
                  className="block p-4"
                >
                  {submitted ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                      <IconCircleCheck className="text-success size-8" />
                      <p className="text-fg text-sm font-medium">
                        {h.help3SuccessTitle}
                      </p>
                      <p className="text-muted text-xs">
                        {h.help3SuccessDescription}
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(event) =>
                        handleContactSubmit(event, setSubmitted)
                      }
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="help3-name" className="text-xs">
                          {h.help3NameLabel}
                        </Label>
                        <Input
                          id="help3-name"
                          required
                          placeholder={h.help3NamePlaceholder}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="help3-email" className="text-xs">
                          {h.help3EmailLabel}
                        </Label>
                        <Input
                          id="help3-email"
                          type="email"
                          required
                          placeholder={h.help3EmailPlaceholder}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="help3-message" className="text-xs">
                          {h.help3MessageLabel}
                        </Label>
                        <Textarea
                          id="help3-message"
                          required
                          rows={3}
                          placeholder={h.help3MessagePlaceholder}
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        rightIcon={<IconSend size={14} />}
                      >
                        {h.help3SendLabel}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              <div className="border-border bg-surface text-muted flex items-center gap-1.5 border-t px-4 py-2 text-[11px]">
                <IconClock size={12} />
                {h.help3ResponseTime}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleOpen(setOpen)}
            aria-expanded={open}
            aria-label={open ? h.help3CloseAria : h.help3OpenAria}
            className="bg-brand text-brand-fg focus-visible:ring-brand absolute right-6 bottom-6 z-10 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-150 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {open ? <IconX size={22} /> : <IconLifebuoy size={22} />}
          </button>
        </div>
      </div>
    </section>
  );
}
