"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFaqMessages } from "@/types/pages/faq/FaqMessages-types";

const GENERAL_ITEMS = [
  { qKey: "faq12Cat1Q1", aKey: "faq12Cat1A1" },
  { qKey: "faq12Cat1Q2", aKey: "faq12Cat1A2" },
  { qKey: "faq12Cat1Q3", aKey: "faq12Cat1A3" },
] as const;

const BILLING_ITEMS = [
  { qKey: "faq12Cat2Q1", aKey: "faq12Cat2A1" },
  { qKey: "faq12Cat2Q2", aKey: "faq12Cat2A2" },
  { qKey: "faq12Cat2Q3", aKey: "faq12Cat2A3" },
] as const;

const SECURITY_ITEMS = [
  { qKey: "faq12Cat3Q1", aKey: "faq12Cat3A1" },
  { qKey: "faq12Cat3Q2", aKey: "faq12Cat3A2" },
] as const;

const DATA_ITEMS = [
  { qKey: "faq12Cat4Q1", aKey: "faq12Cat4A1" },
  { qKey: "faq12Cat4Q2", aKey: "faq12Cat4A2" },
  { qKey: "faq12Cat4Q3", aKey: "faq12Cat4A3" },
] as const;

interface FaqCategory {
  id: string;
  labelKey: string;
  items: readonly { qKey: string; aKey: string }[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "general", labelKey: "faq12Cat1Label", items: GENERAL_ITEMS },
  { id: "billing", labelKey: "faq12Cat2Label", items: BILLING_ITEMS },
  { id: "security", labelKey: "faq12Cat3Label", items: SECURITY_ITEMS },
  { id: "data", labelKey: "faq12Cat4Label", items: DATA_ITEMS },
];

function handleIntersect(
  entries: IntersectionObserverEntry[],
  setActive: Dispatch<SetStateAction<string>>,
) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      setActive(entry.target.id);
    }
  }
}

function handleSelectCategory(
  id: string,
  setActive: Dispatch<SetStateAction<string>>,
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>,
) {
  setActive(id);
  sectionRefs.current[id]?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SidebarScrollSyncFaq() {
  const t = useMessages("pages") as unknown as PagesWithFaqMessages;
  const f = t.faq;
  const [activeCat, setActiveCat] = useState(FAQ_CATEGORIES[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => handleIntersect(entries, setActiveCat),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const category of FAQ_CATEGORIES) {
      const node = sectionRefs.current[category.id];
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <nav
          aria-label="FAQ categories"
          className="border-border flex flex-col gap-1 lg:sticky lg:top-24 lg:col-span-4 lg:self-start lg:border-r lg:pr-8"
        >
          {FAQ_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                handleSelectCategory(category.id, setActiveCat, sectionRefs)
              }
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeCat === category.id
                  ? "bg-surface-hover text-fg font-medium"
                  : "text-muted hover:bg-surface-hover hover:text-fg"
              }`}
            >
              {f[category.labelKey]}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-12 lg:col-span-8">
          {FAQ_CATEGORIES.map((category) => (
            <section
              key={category.id}
              id={category.id}
              ref={(node) => {
                sectionRefs.current[category.id] = node;
              }}
              className="scroll-mt-28"
            >
              <h3 className="text-fg mb-4 text-lg font-semibold tracking-tight">
                {f[category.labelKey]}
              </h3>
              <Accordion type="single" collapsible>
                {category.items.map((item) => (
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
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
