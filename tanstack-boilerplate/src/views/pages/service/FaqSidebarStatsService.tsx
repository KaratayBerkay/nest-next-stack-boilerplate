"use client";

import { IconChevronDown, IconVideo } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";

const FAQ_ITEMS = [
  { qKey: "service5Faq1Q", aKey: "service5Faq1A" },
  { qKey: "service5Faq2Q", aKey: "service5Faq2A" },
  { qKey: "service5Faq3Q", aKey: "service5Faq3A" },
  { qKey: "service5Faq4Q", aKey: "service5Faq4A" },
] as const;

const FACTS = [
  { id: "price", labelKey: "service5Fact1Label", valueKey: "service5Fact1Value" },
  { id: "delivery", labelKey: "service5Fact2Label", valueKey: "service5Fact2Value" },
  { id: "revisions", labelKey: "service5Fact3Label", valueKey: "service5Fact3Value" },
] as const;

export function FaqSidebarStatsService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
          <article className="flex min-w-0 flex-col gap-6">
            <Badge variant="soft" size="sm" className="w-fit">
              <IconVideo size={14} className="mr-1.5" aria-hidden="true" />
              {s.service5Eyebrow}
            </Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {s.service5Heading}
            </h2>
            <p className="text-muted max-w-xl leading-relaxed">{s.service5Intro}</p>

            <Accordion type="single" collapsible className="mt-2">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.qKey} value={item.qKey}>
                  <AccordionTrigger>
                    <span>{s[item.qKey]}</span>
                    <IconChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                    />
                  </AccordionTrigger>
                  <AccordionContent>{s[item.aKey]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </article>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Card variant="default">
                <CardHeader>
                  <span className="text-fg text-sm font-semibold tracking-wide uppercase">
                    {s.service5SidebarTitle}
                  </span>
                </CardHeader>
                <CardContent>
                  <dl className="border-border flex flex-col gap-3 border-t pt-4">
                    {FACTS.map((fact) => (
                      <div key={fact.id} className="flex items-center justify-between gap-3">
                        <dt className="text-muted text-sm">{s[fact.labelKey]}</dt>
                        <dd className="text-fg text-sm font-medium">{s[fact.valueKey]}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="border-border mt-5 flex flex-col gap-1.5 border-t pt-5">
                    <span className="text-fg text-sm font-semibold">
                      {s.service5SidebarCtaTitle}
                    </span>
                    <p className="text-muted text-sm leading-relaxed">
                      {s.service5SidebarCtaBody}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" className="w-full justify-center">
                    {s.service5SidebarCta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
