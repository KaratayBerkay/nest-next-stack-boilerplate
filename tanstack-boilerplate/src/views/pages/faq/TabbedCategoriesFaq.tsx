"use client";

import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const GENERAL_ITEMS = [
  { qKey: "faq18Tab1Q1", aKey: "faq18Tab1A1" },
  { qKey: "faq18Tab1Q2", aKey: "faq18Tab1A2" },
  { qKey: "faq18Tab1Q3", aKey: "faq18Tab1A3" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq18Tab2Q1", aKey: "faq18Tab2A1" },
  { qKey: "faq18Tab2Q2", aKey: "faq18Tab2A2" },
  { qKey: "faq18Tab2Q3", aKey: "faq18Tab2A3" },
] as const;

const SECURITY_ITEMS = [
  { qKey: "faq18Tab3Q1", aKey: "faq18Tab3A1" },
  { qKey: "faq18Tab3Q2", aKey: "faq18Tab3A2" },
  { qKey: "faq18Tab3Q3", aKey: "faq18Tab3A3" },
] as const;

interface FaqTab {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_TABS: FaqTab[] = [
  { id: "general", labelKey: "faq18Tab1Label", items: GENERAL_ITEMS },
  { id: "billing", labelKey: "faq18Tab2Label", items: BILLING_ITEMS },
  { id: "security", labelKey: "faq18Tab3Label", items: SECURITY_ITEMS },
];

export function TabbedCategoriesFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-4 lg:col-span-4">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.faq18Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.faq18Title}
          </h2>
          <p className="text-muted leading-relaxed">{f.faq18Intro}</p>
        </div>
        <div className="lg:col-span-8">
          <Tabs defaultValue={FAQ_TABS[0].id}>
            <TabsList>
              {FAQ_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {f[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            {FAQ_TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <Accordion type="single" collapsible>
                  {tab.items.map((item) => (
                    <AccordionItem key={item.qKey} value={item.qKey}>
                      <AccordionTrigger>
                        <span>{f[item.qKey]}</span>
                        <IconChevronDown
                          size={16}
                          className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                        />
                      </AccordionTrigger>
                      <AccordionContent>{f[item.aKey]}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
